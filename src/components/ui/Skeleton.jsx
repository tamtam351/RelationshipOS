export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[var(--color-surface-elevated)] rounded-xl ${className}`} />
  )
}
