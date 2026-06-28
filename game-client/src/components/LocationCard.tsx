import type { LocationDisplay } from '../data/locations'
import { NPCS } from '../data/npcs'

export function LocationCard({
  loc,
  onClick,
}: {
  loc: LocationDisplay
  onClick: () => void
}) {
  const npc = NPCS[loc.npc]
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-edge bg-white/70 p-6 text-left shadow-sm transition
                 hover:-translate-y-1 hover:border-accent hover:shadow-md"
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: npc.colorVar }}
      />
      <div className="text-4xl">{loc.emoji}</div>
      <h3 className="font-display text-xl text-ink">{loc.name}</h3>
      <p className="text-sm leading-snug text-ink-soft">{loc.blurb}</p>
      <div className="mt-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider" style={{ color: npc.accent }}>
        <span>{npc.emoji}</span>
        <span>Talk to {npc.name.split(' ')[0]}</span>
        <span className="ml-auto opacity-0 transition group-hover:opacity-100">→</span>
      </div>
    </button>
  )
}
