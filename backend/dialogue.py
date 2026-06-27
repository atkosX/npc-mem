"""Dialogue generation: scoped recall (context only) + ONE controlled LLM call.

This is the seam the design doc wants (PDF §10, §24): retrieval is separated from
generation, so a response validator can later sit between them. Using
only_context=True keeps each request to a single generation call (cheaper and far
friendlier to the Gemini free-tier daily cap than letting recall generate one
answer per retrieved source).
"""
import os

from litellm import acompletion

import config  # noqa: F401  -- loads .env + sets cognee dirs on import
from memory import LOCK, as_text, recall_for_npc
from npcs import NPCS

_MAX_CONTEXT_CHARS = 6000


async def generate_response(npc_id: str, player_input: str) -> dict:
    """Recall the NPC's scoped memories, then generate one in-character reply."""
    if npc_id not in NPCS:
        raise KeyError(npc_id)
    npc = NPCS[npc_id]

    # Retrieval (touches Kuzu) — serialize it. No LLM generation here.
    async with LOCK:
        ctx_results = await recall_for_npc(npc_id, player_input, context_only=True)

    context = "\n\n".join(as_text(r) for r in ctx_results)[:_MAX_CONTEXT_CHARS]

    messages = [
        {"role": "system", "content": npc["persona"]},
        {"role": "user", "content": (
            f'The player says to you: "{player_input}"\n\n'
            "Below is what you remember — your own memories plus anything you have "
            "heard. Answer ONLY from this; do not invent facts that are not here.\n\n"
            f"--- YOUR MEMORIES ---\n{context}"
        )},
    ]
    resp = await acompletion(
        model=os.environ["LLM_MODEL"],
        api_key=os.environ.get("LLM_API_KEY"),
        messages=messages,
        temperature=0.7,
    )
    return {
        "npc_id": npc_id,
        "name": npc["name"],
        "npc_line": resp.choices[0].message.content.strip(),
        "memories_used": len(ctx_results),
        "model": os.environ["LLM_MODEL"],
    }
