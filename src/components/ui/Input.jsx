export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl
          bg-[var(--color-surface)] border border-[var(--color-border)]
          text-white placeholder:text-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)]/50
          transition-all duration-200
          ${error ? 'border-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl min-h-[100px]
          bg-[var(--color-surface)] border border-[var(--color-border)]
          text-white placeholder:text-[var(--color-text-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 focus:border-[var(--color-accent)]/50
          transition-all duration-200 resize-y
          ${error ? 'border-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
