"""FastAPI layer over the Phase 1 memory engine — the surface the Godot client calls.

Run:
    .venv/bin/uvicorn api:app --reload --port 8000

Seeding/reset are dev operations; seeding is heavy (LLM calls) so prefer the CLI:
    .venv/bin/python ask.py --reset --seed
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import config  # noqa: F401  -- loads .env + sets cognee dirs on import
import dialogue
import memory
from npcs import NPCS

app = FastAPI(title="Neighbourhood Echoes - Memory API", version="0.1.0")


class DialogueRequest(BaseModel):
    npc_id: str
    player_input: str


class RecallRequest(BaseModel):
    npc_id: str
    query: str
    context_only: bool = True


@app.get("/health")
async def health():
    return {"status": "ok", "npcs": list(NPCS)}


@app.get("/npcs")
async def list_npcs():
    return [
        {"id": k, "name": v["name"], "datasets": v["datasets"]}
        for k, v in NPCS.items()
    ]


@app.post("/dialogue/respond")
async def dialogue_respond(req: DialogueRequest):
    """Main game endpoint: NPC replies in character, grounded in its own memory."""
    try:
        return await dialogue.generate_response(req.npc_id, req.player_input)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown npc_id: {req.npc_id}")


@app.post("/memory/recall")
async def memory_recall(req: RecallRequest):
    """Debug endpoint: raw scoped recall for an NPC (proof of dataset isolation)."""
    if req.npc_id not in NPCS:
        raise HTTPException(status_code=404, detail=f"Unknown npc_id: {req.npc_id}")
    async with memory.LOCK:
        results = await memory.recall_for_npc(
            req.npc_id, req.query, context_only=req.context_only
        )
    return {"npc_id": req.npc_id, "results": [memory.as_text(r) for r in results]}


@app.post("/admin/reset")
async def admin_reset():
    """Wipe all cognee memory state (fast, no LLM calls). Reseed via the CLI."""
    async with memory.LOCK:
        await memory.reset()
    return {"status": "reset"}
