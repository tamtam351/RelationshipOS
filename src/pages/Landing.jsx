import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'

export default function Landing() {
  return (
    <div className="min-h-dvh bg-[#050505] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#1ED760]/[0.05] blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1ED760]/20 flex items-center justify-center">
            <span className="text-[#1ED760] text-xs font-semibold">R</span>
          </div>
          <span className="text-sm font-medium tracking-tight">Relationship OS</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/register"><Button size="sm" className="!bg-[#1ED760] !text-black hover:!bg-[#1ED760]/90">Get started</Button></Link>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pt-14 sm:pt-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[#1ED760] text-sm tracking-wide mb-5">Private space for two</p>
          <h1 className="text-[2.25rem] sm:text-6xl font-semibold tracking-tight leading-[1.08] mb-4 sm:mb-5">
            What should<br />we do?
          </h1>
          <p className="text-[#A1A1AA] text-[15px] sm:text-lg max-w-md mx-auto mb-8 sm:mb-10 text-balance">
            One button. Infinite ideas. Feisty games, bonding questions, and chaos — generated for the two of you.
          </p>
          <Link to="/register">
            <Button size="lg" className="!bg-[#1ED760] !text-black hover:!bg-[#1ED760]/90 font-semibold px-8">
              Create your space
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-20 sm:mt-28"
        >
          <div className="inline-flex flex-col items-center justify-center w-40 h-40 rounded-[2rem] bg-[#111111] border border-white/10 glow-accent">
            <span className="text-3xl mb-1">🎲</span>
            <span className="text-xs font-medium text-[#1ED760] tracking-wide">DO SOMETHING</span>
          </div>
          <p className="mt-6 text-sm text-[#71717A]">Synced across both your phones.</p>
        </motion.div>
      </main>

      <footer className="relative z-10 mt-24 pb-10 text-center text-xs text-[#71717A]">
        Relationship OS · Only for the two of you
      </footer>
    </div>
  )
}
