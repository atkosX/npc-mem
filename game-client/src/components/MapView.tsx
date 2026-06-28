import { useGame } from '../state/gameStore'
import { LOCATIONS } from '../data/locations'
import { LocationCard } from './LocationCard'

export function MapView() {
  const { selectNpc } = useGame()
  return (
    <div className="animate-fade-up">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-soft">
        Maple Street — choose where to go
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((loc) => (
          <LocationCard key={loc.id} loc={loc} onClick={() => selectNpc(loc.npc)} />
        ))}
      </div>
    </div>
  )
}
