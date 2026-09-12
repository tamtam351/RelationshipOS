import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await updatePassword(password)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-4 bg-[var(--color-background)]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">New password</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Choose a strong one</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>}
          <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <Button type="submit" className="w-full" loading={loading}>Update password</Button>
        </form>
      </motion.div>
    </div>
  )
}
