import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Image, MessageSquare, Gamepad2, BookOpen, Plus, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Avatar } from '../components/ui/Avatar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

export default function Dashboard() {
  const { profile } = useAuth()
  const { relationship, partner, stats, loading, members } = useRelationship()
  const [prompt, setPrompt] = useState(null)
  const [myAnswer, setMyAnswer] = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [promptLoading, setPromptLoading] = useState(true)

  useEffect(() => {
    async function loadPrompt() {
      const { data: prompts } = await supabase.from('daily_prompts').select('*').limit(20)
      if (prompts?.length) {
        const today = new Date().toDateString()
        const idx = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % prompts.length
        setPrompt(prompts[idx])
      }
      setPromptLoading(false)
    }
    loadPrompt()
  }, [])

  async function submitAnswer() {
    if (!prompt || !myAnswer.trim() || !relationship) return
    const { error } = await supabase.from('prompt_responses').upsert({
      relationship_id: relationship.id,
      user_id: profile.id,
      prompt_id: prompt.id,
      answer: myAnswer.trim()
    }, { onConflict: 'relationship_id,user_id,prompt_id' })
    if (!error) {
      setSubmitted(true)
      // check partner
      if (partner) {
        const { data } = await supabase
          .from('prompt_responses')
          .select('answer')
          .eq('relationship_id', relationship.id)
          .eq('prompt_id', prompt.id)
          .eq('user_id', partner.id)
          .maybeSingle()
        if (data) setPartnerAnswer(data.answer)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-semibold">
          {greeting}, {profile?.display_name?.split(' ')[0]}.
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Welcome back to {relationship?.name || 'your space'}.
        </p>
      </motion.div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="flex -space-x-3">
            <Avatar src={profile?.avatar_url} name={profile?.display_name} size="lg" className="ring-2 ring-[var(--color-background)]" />
            <Avatar src={partner?.avatar_url} name={partner?.display_name || '?'} size="lg" className="ring-2 ring-[var(--color-background)]" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-semibold">{relationship?.name}</h2>
            <p className="text-[var(--color-text-secondary)]">
              {stats.daysTogether > 0 ? `Together for ${stats.daysTogether} days` : 'Your shared space'}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center w-full sm:w-auto">
            {[
              { label: 'Memories', value: stats.memories },
              { label: 'Notes', value: stats.notes },
              { label: 'Games', value: stats.games },
              { label: 'Lore', value: stats.lore },
            ].map(s => (
              <div key={s.label}>
                <div className="text-lg font-semibold">{s.value}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Today's prompt */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Today's little thing</h3>
        <Card>
          {promptLoading ? <Skeleton className="h-20" /> : prompt ? (
            <div className="space-y-4">
              <p className="text-lg">{prompt.prompt}</p>
              {!submitted ? (
                <div className="flex gap-2">
                  <input
                    value={myAnswer}
                    onChange={e => setMyAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
                  />
                  <Button onClick={submitAnswer} disabled={!myAnswer.trim()}>Send</Button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[var(--color-text-muted)]">You: </span>
                    {myAnswer}
                  </div>
                  {partnerAnswer ? (
                    <div>
                      <span className="text-[var(--color-text-muted)]">{partner?.display_name}: </span>
                      {partnerAnswer}
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-muted)]">Waiting for them to answer...</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[var(--color-text-muted)]">No prompt today.</p>
          )}
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/memories', icon: Image, label: 'Add memory' },
            { to: '/notes', icon: MessageSquare, label: 'Write a note' },
            { to: '/games', icon: Gamepad2, label: 'Play a game' },
            { to: '/lore', icon: BookOpen, label: 'Add lore' },
          ].map(a => (
            <Link key={a.to} to={a.to}>
              <Card hover className="flex flex-col items-center gap-2 py-5 text-center">
                <a.icon className="w-5 h-5 text-[var(--color-accent)]" />
                <span className="text-sm">{a.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
