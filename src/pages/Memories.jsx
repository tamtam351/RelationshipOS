import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image, Plus, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Avatar } from '../components/ui/Avatar'

export default function Memories() {
  const { profile } = useAuth()
  const { relationship } = useRelationship()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', memory_date: '', image: null })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (relationship) load()
  }, [relationship])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('memories')
      .select('*, profiles:created_by(display_name, avatar_url)')
      .eq('relationship_id', relationship.id)
      .order('memory_date', { ascending: false })
    setMemories(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    let image_url = null
    if (form.image) {
      const path = `${relationship.id}/${Date.now()}-${form.image.name}`
      const { error: upErr } = await supabase.storage.from('memories').upload(path, form.image)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('memories').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    }
    const { error } = await supabase.from('memories').insert({
      relationship_id: relationship.id,
      created_by: profile.id,
      title: form.title,
      description: form.description,
      memory_date: form.memory_date || null,
      image_url
    })
    setSaving(false)
    if (!error) {
      setShowForm(false)
      setForm({ title: '', description: '', memory_date: '', image: null })
      load()
    }
  }

  const filtered = memories.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Memories</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Moments that matter</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add memory</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search memories..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input label="Date" type="date" value={form.memory_date} onChange={e => setForm(f => ({ ...f, memory_date: e.target.value }))} />
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files?.[0] }))} className="text-sm" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Save</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Nothing here yet."
          description="Your first memory is waiting."
          actionLabel="Add memory"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="overflow-hidden p-0 h-full flex flex-col">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[var(--color-surface-elevated)] flex items-center justify-center">
                    <Image className="w-8 h-8 text-[var(--color-text-muted)]" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-medium mb-1">{m.title}</h3>
                  {m.description && <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{m.description}</p>}
                  <div className="mt-auto flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{m.memory_date || new Date(m.created_at).toLocaleDateString()}</span>
                    <span>{m.profiles?.display_name}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
