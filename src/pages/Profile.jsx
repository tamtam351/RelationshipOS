import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    let avatar_url = profile?.avatar_url
    if (avatarFile) {
      const path = `${user.id}/${Date.now()}-${avatarFile.name}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl
      }
    }
    const { error } = await supabase.from('profiles').update({
      display_name: form.display_name,
      username: form.username.toLowerCase(),
      bio: form.bio,
      avatar_url
    }).eq('id', user.id)
    setSaving(false)
    if (error) setMessage(error.message)
    else {
      setMessage('Saved')
      refreshProfile()
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">How you appear in your space</p>
      </div>
      <Card>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url} name={form.display_name} size="xl" />
            <div>
              <label className="text-sm text-[var(--color-text-secondary)]">Avatar</label>
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0])} className="block mt-1 text-sm" />
            </div>
          </div>
          <Input label="Display name" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} required />
          <Input label="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          <Textarea label="Bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A little about you..." />
          {message && <p className="text-sm text-[var(--color-accent)]">{message}</p>}
          <Button type="submit" loading={saving}>Save changes</Button>
        </form>
      </Card>
    </div>
  )
}
