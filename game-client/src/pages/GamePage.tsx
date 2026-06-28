import { useGame } from '../state/gameStore'
import { NPCS } from '../data/npcs'
import { MapView } from '../components/MapView'
import { NPCPanel } from '../components/NPCPanel'
import { DialogueBox } from '../components/DialogueBox'
import { CaseNotebook } from '../components/CaseNotebook'
import { MemoryDebugger } from '../components/MemoryDebugger'
import { HowItWorks } from '../components/HowItWorks'

export function GamePage() {
  const g = useGame()
  const { state, selectedNpc } = g
  if (!state) return null

  return (
    <div className="min-h-screen pb-24">
      <TopBar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {selectedNpc ? <Conversation npcId={selectedNpc} /> : <MapView />}
      </main>

      <BottomBar />

      {g.error && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-suspicion/30 bg-suspicion/10 px-4 py-2 text-sm text-suspicion shadow">
          {g.error}{' '}
          <button onClick={g.clearError} className="ml-2 underline">
            dismiss
          </button>
        </div>
      )}

      {g.showNotebook && <CaseNotebook />}
      {g.showDebugger && <MemoryDebugger />}
      {g.showHowItWorks && <HowItWorks />}
    </div>
  )
}

function TopBar() {
  const { state, toggleHowItWorks, startGame } = useGame()
  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <span className="font-display text-lg text-ink">Neighbourhood Echoes</span>
        <span
          className="rounded-full bg-ink px-3 py-1 font-mono text-xs uppercase tracking-wider text-paper"
        >
          Day {state?.day}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => toggleHowItWorks(true)}
            className="font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-ink"
          >
            How it works
          </button>
          <button
            onClick={() => startGame(false)}
            className="rounded-md border border-edge px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink-soft hover:bg-paper-2"
          >
            ↻ Restart
          </button>
        </div>
      </div>
    </header>
  )
}

function Conversation({ npcId }: { npcId: import('../types').NpcId }) {
  const { backToMap, debug } = useGame()
  const hints = (debug[npcId] ?? []).slice(-4).reverse()
  const npc = NPCS[npcId]

  return (
    <div className="animate-fade-up">
      <button
        onClick={backToMap}
        className="mb-4 font-mono text-xs uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Back to map
      </button>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr_240px]">
        <NPCPanel npcId={npcId} />
        <DialogueBox />
        <aside className="flex flex-col gap-3 rounded-2xl border border-edge bg-white/60 p-4">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            What {npc.name.split(' ')[0]} remembers
          </h4>
          {hints.length === 0 ? (
            <p className="text-xs text-ink-soft">Nothing notable yet.</p>
          ) : (
            hints.map((m) => (
              <div key={m.id} className="rounded-lg border border-edge bg-paper p-2 text-[12px] leading-snug text-ink">
                <span className="font-mono text-[10px] uppercase" style={{ color: npc.accent }}>
                  {m.type}
                </span>
                <p>{m.canonicalText}</p>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  )
}

function BottomBar() {
  const { state, toggleNotebook, toggleDebugger, advanceDay, concludeGame, loading } = useGame()
  const day = state?.day ?? 1

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-edge bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        <button
          onClick={toggleNotebook}
          className="rounded-lg border border-edge bg-white/70 px-4 py-2 text-sm text-ink hover:bg-paper-2"
        >
          📓 Case Notebook{state?.notebook.length ? ` (${state.notebook.length})` : ''}
        </button>
        <button
          onClick={toggleDebugger}
          className="rounded-lg border border-edge bg-white/70 px-4 py-2 text-sm text-ink hover:bg-paper-2"
        >
          🧠 Memory Debugger
        </button>

        <div className="ml-auto">
          {day < 2 ? (
            <button
              onClick={advanceDay}
              disabled={loading}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              🌙 Advance to Day 2
            </button>
          ) : (
            <button
              onClick={concludeGame}
              disabled={loading}
              className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-accent disabled:opacity-60"
            >
              ⚖️ Conclude the Case
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
