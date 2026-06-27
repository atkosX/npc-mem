# Neighbourhood Echoes — Game Client (Phase 2)

A minimal Godot 4 top-down scene: walk up to an NPC, talk to them, and their reply
comes from the **backend memory engine** (`../backend`). Same question to different
NPCs → different answers, now inside the game.

## Prerequisites

1. **Godot 4.x** — download from <https://godotengine.org/download> (the standard,
   non-.NET build is fine). This project targets Godot 4.x; it will **not** open in 3.x.
2. **Backend running** (in another terminal):
   ```bash
   cd ../backend
   .venv/bin/uvicorn api:app --port 8000
   ```
   Memories must already be seeded (`.venv/bin/python ask.py --reset --seed`).

## Run

1. Open Godot → **Import** → select this `game-client/` folder (pick `project.godot`).
2. Let Godot import assets on first open (a `.godot/` folder appears — that's normal).
3. Press **F5** (Play). 

## Controls

| Key | Action |
|---|---|
| Arrow keys | Move |
| Space / Enter | Talk to the nearest NPC (Maya = red, Sam = blue, Jules = green) |
| Type + Enter | Send your line to that NPC |
| Esc | Leave the conversation |

Try asking each NPC *"Who broke into the shed?"* and watch them diverge.

## What this proves (and what it doesn't yet)

✅ Player walks the neighbourhood and holds **memory-backed conversations** — the NPC
replies are generated from each character's own Cognee dataset via `/dialogue/respond`.

⬜ **Not yet:** the NPC remembering *new* things you say this session. `/dialogue/respond`
currently only *recalls*; it does not write your line back as a new memory. That
write-back is the next increment (and on the Gemini free tier it's quota-heavy, so
it likely wants session-memory or billing first).

## How it's wired

| File | Role |
|---|---|
| `project.godot` | Config; autoloads `GameApi` + `DialogueUI`; main scene = `Main.tscn` |
| `Main.tscn` | The world: Player + Maya/Sam/Jules (each in the `npcs` group) |
| `scripts/GameApi.gd` | Autoload — POSTs to `http://127.0.0.1:8000/dialogue/respond` |
| `scripts/DialogueUI.gd` | Autoload — builds the dialogue box in code, shows replies |
| `scripts/Player.gd` | Arrow-key movement; Space/Enter opens dialogue with nearest NPC |
| `scripts/NPC.gd` | Holds `npc_id` / `npc_name` (set per-node in `Main.tscn`) |

The dialogue UI is built entirely in code (no UI nodes in the scene) and input uses
Godot's built-in actions — so there's no input-map or UI wiring to set up by hand.

## If something breaks

Paste the **Godot Output/Debugger panel** text back to me. Common ones:
- *"Connection refused" / red Error in the box* → backend isn't running on :8000.
- *Sprites invisible* → reopen the project so Godot finishes importing `icon.svg`.
- *Quota error in the reply* → today's Gemini free-tier cap; rotate `LLM_MODEL` in
  `backend/.env` or enable billing (see `backend/README.md`).
