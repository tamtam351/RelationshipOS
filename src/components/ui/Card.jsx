import { motion } from 'framer-motion'

export function Card({ children, className = '', hover = false, onClick, ...props }) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        bg-[var(--color-surface)] border border-[var(--color-border)]
        rounded-2xl p-5
        ${hover ? 'cursor-pointer hover:border-[var(--color-border-hover)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </Comp>
  )
}
