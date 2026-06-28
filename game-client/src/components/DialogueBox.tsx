import { useGame } from '../state/gameStore'
import { EMOTION_LABEL, NPCS } from '../data/npcs'
import { ChoiceButton } from './ChoiceButton'

export function DialogueBox() {
  const { talk, loading, busyChoice, choose, selectedNpc } = useGame()
  if (!selectedNpc) return null
  const npc = NPCS[selectedNpc]

  return (
    <div className="flex min-h-[320px] flex-col rounded-2xl border border-edge bg-white/70 p-6 shadow-sm paper-grain">
      {loading || !talk ? (
        <div className="flex flex-1 items-center justify-center text-ink-soft">
          <span className="animate-pulse font-mono text-sm">{npc.name} is thinking…</span>
        </div>
      ) : (
        <div key={talk.nodeId} className="animate-fade-up flex flex-1 flex-col">
          <div className="mb-2 flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
            <span style={{ color: npc.accent }}>{npc.name}</span>
            <span className="text-ink-soft">· {EMOTION_LABEL[talk.emotion] ?? talk.emotion}</span>
            <SourceBadge source={talk.source} />
          </div>

          <p className="font-display text-xl leading-relaxed text-ink">“{talk.npcLine}”</p>

          <div className="mt-6 flex flex-col gap-2">
            {talk.choices.length === 0 ? (
              <p className="font-mono text-xs text-ink-soft">
                — {npc.name} has nothing more to say right now. Visit someone else or advance the day.
              </p>
            ) : (
              talk.choices.map((c, i) => (
                <ChoiceButton
                  key={c.id}
                  choice={c}
                  index={i}
                  busy={busyChoice === c.id}
                  disabled={busyChoice !== null}
                  onClick={() => choose(c.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SourceBadge({ source }: { source: 'cognee' | 'fallback' }) {
  const live = source === 'cognee'
  return (
    <span
      title={
        live
          ? 'Line generated through Cognee recall from this NPC’s memory'
          : 'Authored fallback line (Cognee unavailable or guardrail tripped)'
      }
      className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-mono"
      style={{
        background: live ? 'rgba(21,128,61,0.12)' : 'rgba(180,83,9,0.12)',
        color: live ? 'var(--color-trust)' : 'var(--color-accent)',
      }}
    >
      {live ? 'COGNEE' : 'TEMPLATE'}
    </span>
  )
}
