import { useGame } from '../state/gameStore'

export function CaseNotebook() {
  const { state, toggleNotebook } = useGame()
  const notebook = state?.notebook ?? []

  return (
    <Drawer title="Case Notebook" subtitle="Clues & deductions" onClose={toggleNotebook}>
      {notebook.length === 0 ? (
        <Empty text="No clues yet. Talk to people and follow what they reveal." />
      ) : (
        <ol className="flex flex-col gap-3">
          {notebook.map((clue, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-edge bg-paper p-3">
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm leading-snug text-ink">{clue}</span>
            </li>
          ))}
        </ol>
      )}
    </Drawer>
  )
}

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/20" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l border-edge bg-paper p-6 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">{title}</h2>
            <p className="text-xs font-mono uppercase tracking-wider text-ink-soft">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-edge px-2 py-1 text-sm text-ink-soft hover:bg-paper-2"
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-edge p-4 text-sm text-ink-soft">{text}</p>
}
