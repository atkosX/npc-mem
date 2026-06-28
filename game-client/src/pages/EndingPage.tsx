import { useGame } from '../state/gameStore'
import { NPCS } from '../data/npcs'
import type { NpcId } from '../types'

export function EndingPage() {
  const { state, startGame } = useGame()
  const ending = state?.ending
  if (!ending) return null

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12 paper-grain">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Case closed</p>
      <h1 className="mt-2 font-display text-5xl font-semibold text-ink">{ending.title}</h1>

      <div className="mt-8 flex flex-col gap-5">
        <Block label="The Mystery" text={ending.mystery} />
        <Block label="Relationships" text={ending.relationship} />
        <Block label="The Memory Trail" text={ending.memory} />
      </div>

      <div className="mt-8 rounded-2xl border border-edge bg-white/60 p-5">
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          Final standing
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(NPCS) as NpcId[]).map((id) => {
            const rel = state?.relationships[id]
            return (
              <div key={id} className="rounded-lg border border-edge bg-paper p-3 text-center">
                <div className="text-2xl">{NPCS[id].emoji}</div>
                <div className="text-xs font-medium" style={{ color: NPCS[id].accent }}>
                  {NPCS[id].name.split(' ')[0]}
                </div>
                <div className="mt-1 font-mono text-[11px] text-ink-soft">
                  trust {rel?.trust} · sus {rel?.suspicion}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => startGame(false)}
        className="mt-8 self-start rounded-xl bg-ink px-7 py-3 font-display text-lg text-paper transition hover:bg-accent"
      >
        Play again
      </button>
    </div>
  )
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="mb-1 font-mono text-[11px] uppercase tracking-wider text-accent">{label}</h3>
      <p className="font-display text-lg leading-relaxed text-ink">{text}</p>
    </div>
  )
}
