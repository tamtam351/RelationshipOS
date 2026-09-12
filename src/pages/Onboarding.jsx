import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [relName, setRelName] = useState('Us')
  const [startDate, setStartDate] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { profile, refreshProfile, user } = useAuth()
  const { createRelationship, joinRelationship } = useRelationship()
  const navigate = useNavigate()

  async function completeOnboarding() {
    if (user) {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          display_name: name || profile?.display_name,
        })
        .eq('id', user.id)
      await refreshProfile()
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      await createRelationship({ name: relName, startDate: startDate || null })
      await completeOnboarding()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create space')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setLoading(true)
    setError('')
    try {
      await joinRelationship(inviteCode)
      await completeOnboarding()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not join')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-[#050505]">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1ED760]/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-[#1ED760] font-semibold text-xl">R</span>
              </div>
              <h1 className="text-3xl font-semibold mb-3">Welcome to Relationship OS.</h1>
              <p className="text-[#A1A1AA] mb-8">A little internet that belongs to two people.</p>
              <Button size="lg" onClick={() => setStep(1)}>Continue</Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h1 className="text-2xl font-semibold mb-2 text-center">What&apos;s your name?</h1>
              <p className="text-[#A1A1AA] text-center mb-6">This is how you&apos;ll appear in your space.</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={profile?.display_name || 'Your name'}
                className="mb-6"
              />
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!name && !profile?.display_name}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-semibold mb-2 text-center">Create or join?</h1>
              <p className="text-[#A1A1AA] text-center mb-6">Start a new space or join an existing one.</p>
              <Button className="w-full" size="lg" onClick={() => setStep(3)}>
                Create your space
              </Button>
              <Button className="w-full" variant="secondary" size="lg" onClick={() => setStep(5)}>
                Join with invite code
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-semibold mb-2 text-center">Name your space</h1>
              <Input
                label="Relationship name"
                value={relName}
                onChange={(e) => setRelName(e.target.value)}
                placeholder="Us"
              />
              <Input
                label="When did it start? (optional)"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button className="w-full" loading={loading} onClick={handleCreate}>
                Create
              </Button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <h1 className="text-2xl font-semibold mb-2 text-center">Enter invite code</h1>
              <p className="text-[#A1A1AA] text-center mb-4">
                Ask your partner for the code (e.g. LOVE-7X92)
              </p>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="LOVE-XXXX"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button className="w-full" loading={loading} onClick={handleJoin} disabled={!inviteCode}>
                Join
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                Back
              </Button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-semibold mb-3">You&apos;re in.</h1>
              <p className="text-[#A1A1AA] mb-8">Your little corner of the internet is ready.</p>
              <Button size="lg" onClick={() => navigate('/home')}>
                Enter
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}