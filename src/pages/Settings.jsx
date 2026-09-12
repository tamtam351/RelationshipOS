import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function Settings() {
  const { profile, user, signOut } = useAuth()
  const { relationship, refreshRelationship } = useRelationship()
  const navigate = useNavigate()
  const [relName, setRelName] = useState(relationship?.name || '')
  const [startDate, setStartDate] = useState(relationship?.relationship_start_date || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function saveRelationship() {
    if (!relationship) return
    setSaving(true)
    await supabase.from('relationships').update({
      name: relName,
      relationship_start_date: startDate || null
    }).eq('id', relationship.id)
    await refreshRelationship()
    setSaving(false)
  }

  function copyInvite() {
    if (relationship?.invite_code) {
      navigator.clipboard.writeText(relationship.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function leaveRelationship() {
    if (!confirm('Leave this relationship space? You will lose access to shared content.')) return
    await supabase.from('relationship_members').delete().eq('user_id', user.id).eq('relationship_id', relationship.id)
    await signOut()
    navigate('/')
  }

  async function deleteAccount() {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return
    // Note: full deletion of auth user requires service role or edge function.
    // For client: clear profile data and sign out.
    await supabase.from('profiles').delete().eq('id', user.id)
    await signOut()
    navigate('/')
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Account & relationship</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Account</h2>
        <Card className="space-y-2 text-sm">
          <p><span className="text-[var(--color-text-muted)]">Email:</span> {user?.email}</p>
          <p><span className="text-[var(--color-text-muted)]">Username:</span> @{profile?.username}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>Edit profile</Button>
        </Card>
      </section>

      {relationship && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Relationship</h2>
          <Card className="space-y-4">
            <Input label="Name" value={relName} onChange={e => setRelName(e.target.value)} />
            <Input label="Start date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Invite code</label>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-mono">
                  {relationship.invite_code}
                </code>
                <Button variant="secondary" onClick={copyInvite}>{copied ? 'Copied' : 'Copy'}</Button>
              </div>
            </div>
            <Button onClick={saveRelationship} loading={saving}>Save</Button>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Danger zone</h2>
        <Card className="space-y-3 border-red-500/20">
          {relationship && (
            <Button variant="danger" size="sm" onClick={leaveRelationship}>Leave relationship</Button>
          )}
          <Button variant="danger" size="sm" onClick={deleteAccount}>Delete account</Button>
        </Card>
      </section>
    </div>
  )
}
