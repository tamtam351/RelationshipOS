import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Register() {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setError('Username must be 3–20 characters (letters, numbers, underscore)')
      return
    }
    setLoading(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        username: form.username.toLowerCase()
      })
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-4 py-12 bg-[var(--color-background)]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--color-accent)] font-semibold">R</span>
          </div>
          <h1 className="text-2xl font-semibold">Create your space</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">A little internet for two</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <Input label="Display name" value={form.displayName} onChange={update('displayName')} required placeholder="Alex" />
          <Input label="Username" value={form.username} onChange={update('username')} required placeholder="alex" />
          <Input label="Email" type="email" value={form.email} onChange={update('email')} required placeholder="you@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={update('password')} required placeholder="Min. 8 characters" />
          <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required placeholder="••••••••" />
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          Already have a space?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
