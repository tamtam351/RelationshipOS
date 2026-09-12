import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'

export default function Wrapped() {
  const { relationship, stats } = useRelationship()
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [realStats, setRealStats] = useState(null)
  const [period, setPeriod] = useState('month') // month | year

  useEffect(() => {
    if (!relationship) return
    async function calc() {
      setLoading(true)
      const now = new Date()
      let start
      if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
      } else {
        start = new Date(now.getFullYear(), 0, 1)
      }
      const startStr = start.toISOString().slice(0, 10)

      const [mem, notes, games, lore] = await Promise.all([
        supabase.from('memories').select('id, created_at, memory_date').eq('relationship_id', relationship.id).gte('created_at', startStr),
        supabase.from('notes').select('id, created_at').eq('relationship_id', relationship.id).gte('created_at', startStr),
        supabase.from('games').select('id, game_type, created_at').eq('relationship_id', relationship.id).gte('created_at', startStr),
        supabase.from('lore').select('id, created_at').eq('relationship_id', relationship.id).gte('created_at', startStr),
      ])

      const gameTypes = {}
      ;(games.data || []).forEach(g => {
        gameTypes[g.game_type] = (gameTypes[g.game_type] || 0) + 1
      })
      const topGame = Object.entries(gameTypes).sort((a,b) => b[1]-a[1])[0]?.[0] || 'none'

      const days = []
      ;[...(mem.data||[]), ...(notes.data||[])].forEach(item => {
        const d = new Date(item.created_at).toLocaleDateString('en', { weekday: 'long' })
        days.push(d)
      })
      const dayCount = {}
      days.forEach(d => dayCount[d] = (dayCount[d]||0)+1)
      const mostActive = Object.entries(dayCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—'

      setRealStats({
        memories: mem.data?.length || 0,
        notes: notes.data?.length || 0,
        games: games.data?.length || 0,
        lore: lore.data?.length || 0,
        daysTogether: stats.daysTogether,
        topGame,
        mostActive,
        periodLabel: period === 'month' ? now.toLocaleString('default', { month: 'long' }) : String(now.getFullYear())
      })
      setLoading(false)
      setSlide(0)
    }
    calc()
  }, [relationship, period, stats.daysTogether])

  if (loading || !realStats) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>
  }

  const slides = [
    { title: realStats.periodLabel + ' Wrapped', body: 'A look at your shared chapter.', final: false },
    { title: realStats.daysTogether + ' days', body: 'Together so far.', final: false },
    { title: realStats.memories + ' memories', body: 'Moments you chose to keep.', final: false },
    { title: realStats.notes + ' notes', body: 'Words left for each other.', final: false },
    { title: realStats.games + ' games', body: 'Most played: ' + (realStats.topGame !== 'none' ? realStats.topGame.replace(/_/g,' ') : 'none yet'), final: false },
    { title: realStats.lore + ' lore entries', body: 'Inside jokes and legends documented.', final: false },
    { title: 'Most active: ' + realStats.mostActive, body: 'The day you showed up most.', final: false },
    { title: 'Another chapter complete.', body: "Here's to the next one.", final: true },
  ]

  const current = slides[slide]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Wrapped</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Real stats from your data</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={period==='month'?'primary':'secondary'} onClick={() => setPeriod('month')}>Monthly</Button>
          <Button size="sm" variant={period==='year'?'primary':'secondary'} onClick={() => setPeriod('year')}>Yearly</Button>
        </div>
      </div>

      <div className="relative min-h-[360px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-10"
          >
            <Sparkles className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-6" />
            <h2 className="text-3xl font-semibold mb-3 text-balance">{current.title}</h2>
            <p className="text-[var(--color-text-secondary)] text-balance">{current.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-3">
        {slide > 0 && <Button variant="secondary" onClick={() => setSlide(s => s-1)}>Back</Button>}
        {slide < slides.length - 1 ? (
          <Button onClick={() => setSlide(s => s+1)}>Next <ChevronRight className="w-4 h-4" /></Button>
        ) : (
          <Button onClick={() => setSlide(0)}>Replay</Button>
        )}
      </div>
      <div className="flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === slide ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
        ))}
      </div>
    </div>
  )
}
