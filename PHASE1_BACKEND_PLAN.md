# Phase 1 Backend — Implementation Plan

**Project:** Neighbourhood Echoes — NPC Memory Engine (Cognee)
**Phase 1 goal (from the design PDF §19):** *Prove that NPC memory changes dialogue.*
**Date:** 2026-06-27

---

## 1. Success criterion (the only thing Phase 1 must prove)

> Three NPCs — **Maya, Sam, Jules** — each with their **own Cognee memory dataset**, asked the
> **same question** ("Who broke into the community garden shed?"), produce **meaningfully different,
> memory-grounded answers**. Pure Python CLI. No Godot. No art. No API server yet.

Expected divergence (matches PDF §14 + §19):
- **Maya** → protects her brother Sam; anxious; evasive about the key she lost.
- **Sam** → denies involvement; deflects.
- **Jules** → repeats a distorted rumour.

If those three answers come back different *because their datasets differ* — Phase 1 is done.

---

## 2. Scope

**In scope**
- Install + configure cognee (local default DBs).
- 3 per-NPC datasets + 2 shared datasets.
- ~10 seeded memories per NPC + shared lore/rumours.
- Dataset-scoped recall per NPC.
- A CLI to (a) seed, (b) reset, (c) ask a question to one or all NPCs, (d) dump retrieved memories (proof of scoping / early debug viewer).

**Out of scope (later phases)** — FastAPI server, Godot client, promises, gossip spread, relationship numbers, importance scoring, save slots. Stub or hard-code anything not above.

---

## 3. Locked technical decisions (from live-docs research)

| Decision | Choice | Why |
|---|---|---|
| cognee version | pin latest **1.2.x** (1.2.2 at writing) | high-level `remember/recall` API; verify on install |
| Python | 3.11 (any 3.10–3.14) | cognee requirement |
| Stores | **local defaults** SQLite + LanceDB + Kuzu | no servers, single-process CLI is fine |
| LLM | **OpenAI `gpt-4o-mini`** (alt: Gemini flash) | cheap, reliable, default path, avoids macOS local-LLM hangs |
| Embeddings | **`text-embedding-3-small`**, `EMBEDDING_DIMENSIONS=1536` | cheap; **dim MUST match model or vector store breaks** |
| Seeding | `self_improvement=False`, `run_in_background=False` | fast/cheap seed; write fully completes before recall |
| Data dirs | pin `./.cognee_system` + `./.cognee_data` in-project | deterministic; wipe to reset (dodges Kuzu lock bug #1100) |
| Answer generation | `recall(..., system_prompt=<persona>)` (built-in completion) | one call, distinct persona answers, zero extra LLM plumbing |

**The one thing needed from you:** an **OpenAI API key** (`sk-...`) — or a Gemini key. Goes in `backend/.env`, never committed.

---

## 4. The dataset layout

```
npc_maya_memory          # Maya's private memories
npc_sam_memory           # Sam's private memories
npc_jules_memory         # Jules's private memories
neighbourhood_world_lore # shared static facts (the shed, the garden, the old lock)
shared_neighbourhood_rumours  # public rumours everyone may have heard
```

Recall scope per NPC = **own dataset + the two shared datasets**. Because `recall(datasets=[...])`
is leakage-free, Maya never sees Sam's private memories — that's the whole trick.

---

## 5. Seed content (the actual test data)

Mystery truth (PDF §14): Maya lost the key → Sam found it → Omar saw Sam near the shed →
Jules spread a rumour the player was involved → Priya knows the lock was already damaged →
real culprit: a child broke the latch escaping. (Phase 1 only seeds Maya/Sam/Jules + shared.)

- **Maya (~10):** borrowed & lost the shed key; Sam hid in that shed as a kid; wants to avoid
  embarrassment; saw Sam looking shaken that morning; distrusts Omar; fears Jules's gossip.
- **Sam (~10):** found a key on the path; was near the shed that morning; the latch was already
  loose; denies breaking in; scared he'll be blamed; trusts Maya.
- **Jules (~10):** "heard" the player was lurking near the shed; thinks Maya is hiding something;
  loves a dramatic story; saw Maya arguing with Sam; exaggerates.
- **world_lore:** the community garden shed; its lock was old and rusty; layout of the street.
- **rumours:** "someone was seen near the shed before noon."

(Exact memory strings live in `seeds.py`, written as short natural-language sentences — cognee
extracts entities/relationships from them.)

---

## 6. File structure

```
work_1/backend/
  .env.example        # template (committed)
  .env                # real keys (gitignored)
  requirements.txt    # cognee==1.2.*  + python-dotenv
  config.py           # load .env, set cognee dirs + model config
  npcs.py             # NPC sheets: id, name, persona system_prompt, recall datasets
  seeds.py            # the memory strings per dataset
  memory.py           # reset(), seed_all(), recall_for_npc(npc_id, query, mode)
  ask.py              # CLI entrypoint
  README.md           # how to run
work_1/.cognee_system/   # generated (gitignore)
work_1/.cognee_data/     # generated (gitignore)
```

---

## 7. Key code skeletons

**config.py**
```python
import os, pathlib
from dotenv import load_dotenv
import cognee

load_dotenv()
ROOT = pathlib.Path(__file__).resolve().parent.parent
cognee.config.system_root_directory(str(ROOT / ".cognee_system"))
cognee.config.data_root_directory(str(ROOT / ".cognee_data"))
# LLM_API_KEY / EMBEDDING_* read from .env by cognee/LiteLLM
```

**memory.py**
```python
import cognee
from npcs import NPCS
from seeds import SEEDS  # {dataset_name: [memory_str, ...]}

async def reset():
    await cognee.prune.prune_data()
    await cognee.prune.prune_system(metadata=True)

async def seed_all():
    for dataset, memories in SEEDS.items():
        for m in memories:
            await cognee.remember(m, dataset_name=dataset, self_improvement=False)

async def recall_for_npc(npc_id, query, context_only=False):
    npc = NPCS[npc_id]
    return await cognee.recall(
        query_text=query,
        datasets=npc["datasets"],          # own + shared — leakage-free scope
        system_prompt=npc["persona"],      # per-NPC voice
        only_context=context_only,         # True = dump raw memories (proof/debug)
        top_k=8,
    )
```

**ask.py** (CLI) — `--seed`, `--reset`, `--npc <id>`, `--all`, `--context`
```python
# python ask.py --reset --seed
# python ask.py "Who broke into the shed?" --all
# python ask.py "Who broke into the shed?" --npc maya --context
```

---

## 8. Build order

1. `mkdir backend`, create venv, `pip install cognee python-dotenv`, **verify installed version**.
2. `.env.example` + `.env` (user drops in key); `.gitignore` for `.env`, `.cognee_system/`, `.cognee_data/`.
3. `config.py` — dirs + model config.
4. `npcs.py` — 3 NPC sheets with persona prompts + recall scopes.
5. `seeds.py` — the memory strings.
6. `memory.py` — reset / seed_all / recall_for_npc.
7. `ask.py` — CLI.
8. **Run:** `python ask.py --reset --seed` → wait for seed (tens of seconds) → `python ask.py "Who broke into the shed?" --all`.
9. **Verify success criterion** (below).

---

## 9. Validation

- `--all` returns **three different** answers consistent with each NPC's memories/persona.
- `--npc maya --context` dumps Maya's retrieved memories and shows **no** Sam-private/Jules-private
  facts leaked in → proves dataset isolation.
- Re-running `--reset --seed` produces a clean, repeatable result.
- Cost < ~$1, total seed time a few minutes at most.

---

## 10. Risks & mitigations (from issue-tracker research)

| Risk | Mitigation |
|---|---|
| macOS cognify hang (#1743/#2119) | Real cloud `sk-...` key; **no** Ollama/local LLM |
| Embedding dim mismatch breaks vector store | Set `EMBEDDING_DIMENSIONS=1536` to match `text-embedding-3-small` |
| Kuzu file-lock error (#1100) | Wipe `.cognee_system`/`.cognee_data` between runs; single process only |
| Embeddings silently default to OpenAI | Set **both** `LLM_*` and `EMBEDDING_*` (incl. `EMBEDDING_API_KEY`) |
| Seeding too slow/expensive | `self_improvement=False` during seed |

---

## 11. After Phase 1

`memory.py` becomes the core the FastAPI layer wraps (`/memory/recall`, `/dialogue/respond`).
Then Phase 2 = a tiny Godot scene that calls that API. Do **not** open Godot before then.
