import { useGame } from '../state/gameStore'

export function HowItWorks() {
  const { toggleHowItWorks } = useGame()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={() => toggleHowItWorks(false)}
    >
      <div
        className="max-w-lg rounded-2xl border border-edge bg-paper p-7 text-left shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-ink">How memory works</h2>
        <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-ink-soft">
          <li>
            <b className="text-ink">1 · Each NPC has its own memory.</b> Maya, Sam, and Jules
            each recall from a separate Cognee dataset — they do not all know the same facts.
          </li>
          <li>
            <b className="text-ink">2 · Your actions are written down.</b> Promises, secrets,
            and gossip become real memories stored against specific NPCs.
          </li>
          <li>
            <b className="text-ink">3 · Memory travels.</b> Tell Jules a secret and it spreads
            through the neighbourhood — reaching Maya by the next day.
          </li>
          <li>
            <b className="text-ink">4 · They hold you accountable.</b> On Day 2, NPCs react to
            what they remember. Open the <span className="font-mono">Memory Debugger</span> to
            see exactly who knows what.
          </li>
        </ol>
        <button
          onClick={() => toggleHowItWorks(false)}
          className="mt-6 rounded-lg bg-ink px-5 py-2 text-sm text-paper hover:bg-accent"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
