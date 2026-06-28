import { useGame } from '../state/gameStore'
import { NPCS } from '../data/npcs'
import type { MemoryEvent, NpcId } from '../types'

const TYPE_COLOR: Record<MemoryEvent['type'], string> = {
  promise: '#15803d',
  secret: '#b45309',
  gossip: '#7e22ce',
  betrayal: '#b91c1c',
  clue: '#1d4ed8',
  claim: '#44403c',
}

export function MemoryDebugger() {
  const { debug, toggleDebugger } = useGame()
  const ids = Object.keys(NPCS) as NpcId[]

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-ink/30" onClick={toggleDebugger}>
      <section
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border-t border-edge bg-paper p-6 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">🧠 Memory Debugger</h2>
          <button
            onClick={toggleDebugger}
            className="rounded-md border border-edge px-2 py-1 text-sm text-ink-soft hover:bg-paper-2"
          >
            ✕
          </button>
        </div>
        <p className="mb-5 max-w-3xl text-sm text-ink-soft">
          Each NPC recalls only their own Cognee dataset (plus shared rumours). This is
          why they answer differently — and how a secret only reaches Maya once gossip
          spreads it.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          {ids.map((id) => (
            <Column key={id} npcId={id} memories={debug[id] ?? []} />
          ))}
        </div>
      </section>
    </div>
  )
}

function Column({ npcId, memories }: { npcId: NpcId; memories: MemoryEvent[] }) {
  const npc = NPCS[npcId]
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-edge bg-white/60 p-4">
      <div className="flex items-center gap-2 border-b border-edge pb-2">
        <span className="text-xl">{npc.emoji}</span>
        <h3 className="font-display text-base" style={{ color: npc.accent }}>
          {npc.name}
        </h3>
        <span className="ml-auto font-mono text-xs text-ink-soft">{memories.length}</span>
      </div>
      {memories.length === 0 ? (
        <p className="py-4 text-center font-mono text-xs text-ink-soft">no memories yet</p>
      ) : (
        memories.map((m) => <MemoryCard key={m.id + m.canonicalText.slice(0, 8)} m={m} />)
      )}
    </div>
  )
}

function MemoryCard({ m }: { m: MemoryEvent }) {
  return (
    <div className="rounded-lg border border-edge bg-paper p-3">
      <div className="mb-1 flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-white"
          style={{ background: TYPE_COLOR[m.type] }}
        >
          {m.type}
        </span>
        {m.ownerNpc === 'shared' && (
          <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-ink-soft">
            shared
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-ink-soft">
          day {m.day} · imp {m.importance}
        </span>
      </div>
      <p className="text-[13px] leading-snug text-ink">{m.canonicalText}</p>
      <p className="mt-1 font-mono text-[10px] text-ink-soft">
        → {m.datasets.join(', ')}
        {m.writtenOk === false && <span className="text-suspicion"> · cognee write failed (ledger kept)</span>}
      </p>
    </div>
  )
}
