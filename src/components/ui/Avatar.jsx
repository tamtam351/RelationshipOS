export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div className={`relative rounded-full overflow-hidden bg-[var(--color-surface-elevated)] flex items-center justify-center font-medium text-[var(--color-text-secondary)] ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
