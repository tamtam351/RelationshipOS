import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-4 bg-[var(--color-background)]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">We'll send you a link</p>
        </div>
        {sent ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
            <p className="text-[var(--color-text-secondary)] mb-4">Check your email for a reset link.</p>
            <Link to="/login"><Button variant="secondary">Back to sign in</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
          </form>
        )}
        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          <Link to="/login" className="hover:text-white transition-colors">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
