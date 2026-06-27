# Neighbourhood Echoes — Phase 1 Backend

Proves that **NPC memory changes dialogue**: three NPCs, each with their own Cognee
memory dataset, answer the same question differently.

## Setup

```bash
cd backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env   # then put your Gemini key in .env
```

## Run

```bash
# Seed memories (wipes any old state first)
.venv/bin/python ask.py --reset --seed

# Ask all three NPCs the same question
.venv/bin/python ask.py "Who broke into the shed?" --all

# Inspect what one NPC actually retrieved (proof of dataset isolation / debug)
.venv/bin/python ask.py "Who broke into the shed?" --npc maya --context
```

## API (Phase 1.5)

The FastAPI layer (`api.py`) exposes the memory engine for the game client.

```bash
.venv/bin/uvicorn api:app --port 8000        # add --reload while developing
```

| Method | Path | Purpose |
|---|---|---|
| GET  | `/health` | liveness + NPC ids |
| GET  | `/npcs` | NPC list + recall scopes |
| POST | `/dialogue/respond` | NPC reply in character (1 LLM call, grounded) |
| POST | `/memory/recall` | raw scoped recall (debug; `context_only` defaults true) |
| POST | `/admin/reset` | wipe memory state (reseed via the CLI) |

```bash
curl -s -X POST localhost:8000/dialogue/respond -H 'Content-Type: application/json' \
  -d '{"npc_id":"sam","player_input":"Were you near the shed that morning?"}'
```

`/dialogue/respond` does `only_context=True` recall + one controlled generation call,
so it costs a single LLM request and leaves a clean seam for a response validator
(PDF §24). All cognee access is serialized behind a lock (Kuzu is single-writer).

## Success criterion

`--all` returns three meaningfully different, memory-grounded answers:
Maya protects Sam, Sam denies involvement, Jules repeats a rumour.

## Files

| File | Purpose |
|---|---|
| `config.py` | Loads `.env`, pins cognee's local data dirs |
| `npcs.py` | NPC sheets: persona + recall dataset scope |
| `seeds.py` | The seed memories per dataset |
| `memory.py` | `reset()`, `seed_all()`, `recall_for_npc()` |
| `ask.py` | CLI entrypoint |

Local stores (SQLite/LanceDB/Kuzu) live in `.cognee_system/` and `.cognee_data/`.
Delete those folders for a hard reset.

## Gemini free-tier quota (IMPORTANT)

The Google AI Studio **free tier caps each model at ~20 generate-content requests
per day** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`). cognee's
GRAPH_COMPLETION recall generates roughly one answer per retrieved source (~3 per
NPC), so a single `--all` run uses ~9 calls and you exhaust a model quickly.

Mitigations used here:
- **Seeding batches each dataset into one `remember()` call** (see `memory.py`) so
  the full seed is ~10 LLM calls, not ~70.
- **Rotate models** when one is exhausted — edit `LLM_MODEL` in `.env`. Verified
  working models on this key: `gemini-2.5-flash`, `gemini-2.5-flash-lite`,
  `gemini-flash-latest`, `gemini-3.1-flash-lite`. (`gemini-2.0-flash` is **not**
  free-tier enabled on this key — limit 0.)
- Quotas reset daily (Pacific midnight). **For real development, enable billing**
  on the Gemini project — this whole demo costs well under a cent on pay-as-you-go.

Verified config: LLM via Gemini (any model above), embeddings
`gemini/gemini-embedding-001` at **3072 dims** (`EMBEDDING_DIMENSIONS=3072` must
match the model's default output, or the vector store breaks).

## Known behaviour: confabulation

With the raw `recall → LLM` path (no validator yet), lower-tier models embellish —
e.g. Jules invented "Maya lost the key" and "Omar accusing Sam," which are NOT in
her datasets. This confirms the design doc's **Risk 1** and is exactly why the
authored-fallback + response-validator layer (PDF §11, §24) is needed before this
ships. Phase 1 deliberately omits that layer.
