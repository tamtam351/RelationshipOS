import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

export default function Notes() {
  const { profile } = useAuth()
  const { relationship, partner } = useRelationship()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (relationship) load() }, [relationship])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('*, profiles:created_by(display_name)')
      .eq('relationship_id', relationship.id)
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('notes').insert({
      relationship_id: relationship.id,
      created_by: profile.id,
      title: form.title,
      content: form.content,
      type: 'general'
    })
    if (partner) {
      await supabase.from('notifications').insert({
        user_id: partner.id,
        relationship_id: relationship.id,
        type: 'note',
        title: 'New note',
        message: (profile.display_name || 'Someone') + ' left you a note: ' + form.title,
        link: '/notes'
      })
    }
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', content: '' })
    load()
  }

  async function markRead(note) {
    if (note.created_by !== profile.id && !note.is_read) {
      await supabase.from('notes').update({ is_read: true }).eq('id', note.id)
      load()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notes</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Messages for each other</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Write a note</Button>
      </div>
      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Open when..." required />
            <Textarea label="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Send</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Your little inbox is quiet." description="Leave something for them." actionLabel="Write a note" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {notes.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={!n.is_read && n.created_by !== profile.id ? 'border-[var(--color-accent)]/30 cursor-pointer' : 'cursor-pointer'} onClick={() => markRead(n)}>
                <h3 className="font-medium">{n.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 whitespace-pre-wrap">{n.content}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  {n.profiles?.display_name} · {new Date(n.created_at).toLocaleDateString()}
                  {!n.is_read && n.created_by !== profile.id ? ' · Unread' : ''}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
