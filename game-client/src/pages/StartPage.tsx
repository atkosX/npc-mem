import { useGame } from '../state/gameStore'
import { HowItWorks } from '../components/HowItWorks'

export function StartPage() {
  const { startGame, loading, error, toggleHowItWorks, showHowItWorks } = useGame()

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center paper-grain">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-accent">
        A memory-native NPC mystery
      </p>
      <h1 className="font-display text-6xl font-semibold leading-none text-ink sm:text-7xl">
        Neighbourhood
        <br />
        Echoes
      </h1>
      <p className="mt-6 max-w-xl font-display text-xl leading-relaxed text-ink-soft">
        A browser mystery where every NPC has memory. They remember promises, lies,
        secrets, and rumours — then change how they treat you.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          onClick={() => startGame(false)}
          disabled={loading}
          className="rounded-xl bg-ink px-8 py-4 font-display text-lg text-paper transition hover:bg-accent disabled:opacity-60"
        >
          {loading ? 'Waking the neighbourhood…' : 'Start the Mystery'}
        </button>
        <button
          onClick={() => toggleHowItWorks(true)}
          className="font-mono text-xs uppercase tracking-wider text-ink-soft underline-offset-4 hover:underline"
        >
          How memory works ↗
        </button>
      </div>

      {error && (
        <p className="mt-6 max-w-md rounded-lg border border-suspicion/30 bg-suspicion/10 px-4 py-3 text-sm text-suspicion">
          {error}
        </p>
      )}

      {showHowItWorks && <HowItWorks />}
    </div>
  )
}
