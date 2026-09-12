import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-4 bg-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--color-accent)] font-semibold">R</span>
          </div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Sign in to your space</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Don't have a space?{' '}
          <Link to="/register" className="text-[var(--color-accent)] hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
