import type { Relationship } from '../types'

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] font-mono uppercase tracking-wider text-ink-soft">
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  )
}

export function RelationshipMeter({ rel }: { rel: Relationship }) {
  return (
    <div className="flex flex-col gap-2">
      <Bar label="Trust" value={rel.trust} color="var(--color-trust)" />
      <Bar label="Suspicion" value={rel.suspicion} color="var(--color-suspicion)" />
    </div>
  )
}
