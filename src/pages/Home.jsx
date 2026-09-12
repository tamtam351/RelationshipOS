import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, History, LogOut, Copy, Check, Users, DoorOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { generateActivity } from '../lib/ai'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { ALLOW_LEAVE_RELATIONSHIP } from '../lib/devFlags'

const THINKING_LINES = [
  'Thinking...',
  'Checking what you already did...',
  'Trying not to repeat myself...',
  'Making it interesting...',
  'Okay.',
]

const MOODS = [
  { id: null, label: 'Surprise us' },
  { id: 'chaos', label: 'Chaos' },
  { id: 'sweet', label: 'Sweet' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'cheesy', label: 'Cheesy' },
  { id: 'deep', label: 'Deep' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'spicy', label: 'Spicy' },
]

export default function Home() {
  const { profile, signOut } = useAuth()
  const {
    relationship,
    members,
    partner,
    stats,
    partnerJoined,
    clearPartnerJoined,
    rollActivity,
    leaveRelationship,
  } = useRelationship()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('idle') // idle | thinking | reveal
  const [thinkingIdx, setThinkingIdx] = useState(0)
  const [activity, setActivity] = useState(null)
  const [history, setHistory] = useState([])
  const [mood, setMood] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [liveFromPartner, setLiveFromPartner] = useState(false)
  const [turnError, setTurnError] = useState('')
  const [leaving, setLeaving] = useState(false)

  // Turn order only applies once both partners are present. Before
  // that (or if a relationship somehow has no turn set), rolling is
  // always allowed.
  const isMyTurn =
    members.length < 2 || !relationship?.current_turn || relationship.current_turn === profile?.id

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    if (!partnerJoined) return
    const timer = setTimeout(() => clearPartnerJoined(), 4000)
    return () => clearTimeout(timer)
  }, [partnerJoined, clearPartnerJoined])

  const loadHistory = useCallback(async () => {
    if (!relationship) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('relationship_id', relationship.id)
      .order('created_at', { ascending: false })
      .limit(40)
    setHistory(data || [])
  }, [relationship])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Realtime: when partner rolls, you see the same activity
  useEffect(() => {
    if (!relationship?.id) return

    const channel = supabase
      .channel(`activities-${relationship.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `relationship_id=eq.${relationship.id}`,
        },
        (payload) => {
          const row = payload.new
          // Ignore our own inserts if we are already revealing that title
          if (profile && row.created_by === profile.id && phase === 'reveal') {
            loadHistory()
            return
          }
          if (profile && row.created_by === profile.id) {
            loadHistory()
            return
          }
          // Partner rolled — show their activity
          setLiveFromPartner(true)
          setActivity({
            category: row.category,
            title: row.title,
            description: row.description,
            duration: row.duration,
            emoji: row.emoji || '🎲',
            is_saved: row.is_saved,
          })
          setPhase('reveal')
          loadHistory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [relationship?.id, profile?.id, phase, loadHistory])

  async function doSomething() {
    if (!isMyTurn) return
    setTurnError('')
    setLiveFromPartner(false)
    setPhase('thinking')
    setThinkingIdx(0)
    setActivity(null)

    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < THINKING_LINES.length) setThinkingIdx(i)
    }, 700)

    const avoid = history.map((h) => h.title)
    const result = await generateActivity({ mood, avoidTitles: avoid })
    clearInterval(interval)
    setThinkingIdx(THINKING_LINES.length - 1)
    await new Promise((r) => setTimeout(r, 400))

    if (relationship && profile) {
      try {
        await rollActivity({
          relationshipId: relationship.id,
          category: result.category,
          title: result.title,
          description: result.description,
          duration: result.duration,
          emoji: result.emoji,
          mood,
        })
        setActivity(result)
        setPhase('reveal')
        loadHistory()
      } catch (err) {
        // Most likely: partner rolled first in a near-simultaneous tap.
        setTurnError(err.message || 'Could not roll right now.')
        setPhase('idle')
      }
    } else {
      setActivity(result)
      setPhase('reveal')
    }
  }

  async function leaveRoom() {
    if (!confirm('Leave this space? This is a testing-only option and will disconnect you from your partner.')) return
    setLeaving(true)
    try {
      await leaveRelationship()
      navigate('/onboarding', { replace: true })
    } catch (err) {
      alert(err.message || 'Could not leave right now.')
    } finally {
      setLeaving(false)
    }
  }

  async function copyInvite() {
    if (!relationship?.invite_code) return
    try {
      await navigator.clipboard.writeText(relationship.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      prompt('Copy this invite code:', relationship.invite_code)
    }
  }

  function backToIdle() {
    setPhase('idle')
    setActivity(null)
    setLiveFromPartner(false)
  }

  return (
    <div className="min-h-dvh bg-[#050505] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1ED760]/[0.04] blur-[100px]" />
      </div>

      {/* Toast: partner just joined */}
      <AnimatePresence>
        {partnerJoined && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full bg-[#111111] border border-[#1ED760]/30 px-4 py-2.5 shadow-lg"
          >
            <Check className="w-4 h-4 text-[#1ED760]" />
            <span className="text-sm text-white">
              {partnerJoined.name} joined your space!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative z-10 flex items-center justify-between px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2 max-w-lg mx-auto">
        <div>
          <p className="text-sm text-[#A1A1AA]">
            {greeting}, {profile?.display_name?.split(' ')[0]}.
          </p>
          {relationship && (
            <p className="text-xs text-[#71717A] mt-0.5">
              {relationship.name}
              {partner ? ` · with ${partner.display_name?.split(' ')[0]}` : ' · waiting for partner'}
              {stats?.daysTogether > 0 ? ` · ${stats.daysTogether}d` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInvite(true)}
            className="p-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5"
            title="Invite partner"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5"
            title="History"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={signOut}
            className="p-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pt-10 sm:pt-20 text-center"
            >
              <p className="text-[#A1A1AA] text-sm tracking-wide mb-3">What&apos;s the vibe?</p>
              <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMood(m.id)}
                    className={`px-3.5 py-1.5 rounded-full text-sm transition-all ${
                      mood === m.id
                        ? 'bg-[#1ED760] text-black font-medium'
                        : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <h1 className="text-[2.15rem] leading-[1.08] sm:text-5xl font-semibold tracking-tight mb-3 px-1">
                WHAT SHOULD
                <br />
                WE DO?
              </h1>
              <p className="text-[#A1A1AA] mb-10 sm:mb-14 text-[15px]">Let the universe decide.</p>

              <motion.button
                whileHover={isMyTurn ? { scale: 1.03 } : {}}
                whileTap={isMyTurn ? { scale: 0.97 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                onClick={doSomething}
                disabled={!isMyTurn}
                className={`relative mx-auto flex flex-col items-center justify-center w-[10.5rem] h-[10.5rem] sm:w-48 sm:h-48 rounded-[1.75rem] sm:rounded-[2rem] bg-[#111111] border border-white/10 group touch-manipulation ${
                  !isMyTurn ? 'opacity-40 cursor-not-allowed' : ''
                }`}
                style={{ boxShadow: '0 0 40px rgba(30,215,96,0.12)' }}
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🎲</span>
                <span className="text-sm font-medium tracking-wide text-[#1ED760]">DO SOMETHING</span>
              </motion.button>

              {turnError && (
                <p className="mt-4 text-xs text-red-400">{turnError}</p>
              )}

              <p className="mt-10 text-xs text-[#71717A]">
                {!partner
                  ? 'Invite your person so you share the same space.'
                  : isMyTurn
                  ? 'When either of you rolls, both phones can see it.'
                  : `Waiting for ${partner?.display_name?.split(' ')[0] || 'your partner'} to roll — then it's your turn.`}
              </p>
            </motion.div>
          )}

          {phase === 'thinking' && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-24 sm:pt-40 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-8 rounded-full border-2 border-white/10 border-t-[#1ED760]"
              />
              <p className="text-lg text-[#A1A1AA]">{THINKING_LINES[thinkingIdx]}</p>
            </motion.div>
          )}

          {phase === 'reveal' && activity && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pt-8 sm:pt-16"
            >
              {liveFromPartner && (
                <p className="text-center text-xs text-[#1ED760] mb-4 tracking-wide">
                  {partner?.display_name?.split(' ')[0] || 'Partner'} just rolled this
                </p>
              )}

              <div className="rounded-[1.5rem] sm:rounded-[1.75rem] bg-[#111111] border border-white/10 p-6 sm:p-8 text-center">
                <p className="text-4xl mb-3">{activity.emoji || '🎲'}</p>
                <p className="text-xs tracking-[0.2em] text-[#1ED760] font-medium mb-2">
                  {activity.category}
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">{activity.title}</h2>
                <p className="text-[#A1A1AA] text-[15px] leading-relaxed mb-6">
                  {activity.description}
                </p>
                {activity.duration && (
                  <p className="text-xs text-[#71717A] mb-6">{activity.duration}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={backToIdle} className="sm:min-w-[140px]">
                    Done
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={doSomething}
                    disabled={!isMyTurn}
                    className="sm:min-w-[140px]"
                    title={!isMyTurn ? `Waiting for ${partner?.display_name?.split(' ')[0] || 'your partner'} to roll` : undefined}
                  >
                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                    Again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Invite sheet */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-[#111111] border border-white/10 p-6"
            >
              <h3 className="text-xl font-semibold mb-2">Invite your person</h3>
              <p className="text-sm text-[#A1A1AA] mb-5">
                They create an account, choose <strong className="text-white">Join with invite code</strong>, and paste this.
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 mb-4">
                <code className="flex-1 text-lg tracking-widest text-[#1ED760] font-medium">
                  {relationship?.invite_code || '—'}
                </code>
                <button
                  onClick={copyInvite}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                >
                  {copied ? <Check className="w-5 h-5 text-[#1ED760]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {partner ? (
                <p className="text-sm text-[#1ED760]">Connected with {partner.display_name}</p>
              ) : (
                <p className="text-sm text-[#71717A]">Waiting for them to join…</p>
              )}
              <Button className="w-full mt-5" variant="secondary" onClick={() => setShowInvite(false)}>
                Close
              </Button>

              {ALLOW_LEAVE_RELATIONSHIP && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-[#71717A] mb-2 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" />
                    Testing only — remove before real use
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    loading={leaving}
                    onClick={leaveRoom}
                  >
                    Leave this space
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History sheet */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[70vh] overflow-y-auto rounded-3xl bg-[#111111] border border-white/10 p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Recent rolls</h3>
              {history.length === 0 ? (
                <p className="text-sm text-[#71717A]">Nothing yet. Hit DO SOMETHING.</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-2xl bg-black/30 border border-white/5 px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{h.emoji || '🎲'}</span>
                        <div>
                          <p className="text-xs text-[#1ED760] tracking-wide">{h.category}</p>
                          <p className="font-medium">{h.title}</p>
                          <p className="text-sm text-[#A1A1AA] mt-0.5 line-clamp-2">{h.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button className="w-full mt-5" variant="secondary" onClick={() => setShowHistory(false)}>
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
