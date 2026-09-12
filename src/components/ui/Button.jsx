import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const variants = {
  primary: 'bg-[#1ED760] hover:bg-[#1ED760]/90 text-black font-medium',
  secondary: 'bg-[var(--color-surface-elevated)] hover:bg-[#1a1a1a] text-white border border-[var(--color-border)]',
  ghost: 'bg-transparent hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl'
}

export const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', loading, disabled, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
})
