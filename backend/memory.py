"""Core memory operations for Phase 1 — thin wrappers over cognee."""
import asyncio

import config  # noqa: F401  -- loads .env + sets cognee dirs on import
import cognee

from npcs import NPCS
from seeds import SEEDS

# Shared lock: serialize cognee/Kuzu access. The local graph store is single-writer
# and has a known file-lock issue under concurrent access, so the API holds this
# around every cognee call.
LOCK = asyncio.Lock()


def as_text(r):
    """Best-effort extraction of text from a cognee recall result."""
    return getattr(r, "text", None) or str(r)


async def reset():
    """Wipe all cognee state for a clean, repeatable run (no LLM calls)."""
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)


async def _remember_with_retry(text, dataset, max_retries=6):
    """Store one document, retrying with backoff on rate-limit (free-tier 429s)."""
    for attempt in range(max_retries):
        try:
            await cognee.remember(text, dataset_name=dataset, self_improvement=False)
            return True
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if attempt == max_retries - 1:
                print(f"    ! {dataset} FAILED: {type(e).__name__}: {msg[:140]}")
                return False
            wait = 15 * (attempt + 1)
            tag = "rate-limit" if ("429" in msg or "RESOURCE_EXHAUSTED" in msg) else type(e).__name__
            print(f"    ...retrying {dataset} in {wait}s ({tag})")
            await asyncio.sleep(wait)


async def seed_all(pause=3.0):
    """Seed memories, ONE document per dataset.

    We batch each dataset's memories into a single remember() call so cognee runs
    one graph-extraction pass per dataset instead of one per memory. That keeps us
    well under the Gemini free-tier daily request cap (20/model/day) while leaving
    per-NPC dataset isolation — and therefore the divergence proof — intact.
    """
    items = list(SEEDS.items())
    for idx, (dataset, memories) in enumerate(items, 1):
        blob = "\n".join(memories)
        print(f"  [{idx}/{len(items)}] {dataset}: {len(memories)} memories, {len(blob)} chars")
        await _remember_with_retry(blob, dataset)
        await asyncio.sleep(pause)


async def recall_for_npc(npc_id: str, query: str, context_only: bool = False):
    """Recall scoped to one NPC's datasets only (own + shared).

    context_only=True returns the raw retrieved memories (proof of scoping / debug).
    context_only=False returns an LLM answer in the NPC's voice via system_prompt.
    """
    npc = NPCS[npc_id]
    return await cognee.recall(
        query_text=query,
        datasets=npc["datasets"],
        system_prompt=npc["persona"],
        only_context=context_only,
        top_k=8,
    )
