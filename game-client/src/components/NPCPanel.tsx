import { useGame } from '../state/gameStore'
import { NPCS } from '../data/npcs'
import { RelationshipMeter } from './RelationshipMeter'
import type { NpcId } from '../types'

export function NPCPanel({ npcId }: { npcId: NpcId }) {
  const { state } = useGame()
  const npc = NPCS[npcId]
  const rel = state?.relationships[npcId]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-edge bg-white/70 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
          style={{ background: 'color-mix(in srgb, ' + npc.colorVar + ' 14%, white)' }}
        >
          {npc.emoji}
        </div>
        <div>
          <h3 className="font-display text-lg leading-tight text-ink" style={{ color: npc.accent }}>
            {npc.name}
          </h3>
          <p className="text-xs leading-snug text-ink-soft">{npc.role}</p>
        </div>
      </div>
      {rel && <RelationshipMeter rel={rel} />}
    </div>
  )
}
