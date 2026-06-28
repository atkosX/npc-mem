import type { Choice } from '../types'

export function ChoiceButton({
  choice,
  index,
  disabled,
  busy,
  onClick,
}: {
  choice: Choice
  index: number
  disabled?: boolean
  busy?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-start gap-3 rounded-lg border border-edge bg-paper px-4 py-3 text-left transition
                 hover:border-accent hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink font-mono text-xs text-paper group-hover:bg-accent">
        {busy ? '…' : index + 1}
      </span>
      <span className="text-[15px] leading-snug text-ink">{choice.text}</span>
    </button>
  )
}
