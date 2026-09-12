import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-elevated)] flex items-center justify-center mb-5">
          <Icon className="w-6 h-6 text-[var(--color-text-muted)]" />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
