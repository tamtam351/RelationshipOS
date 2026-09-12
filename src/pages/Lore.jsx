import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

const CATEGORIES = ['inside jokes', 'funny moments', 'arguments', 'quotes', 'random events', 'nicknames', 'legendary moments', 'stories', 'gaming']

export default function Lore() {
  const { profile } = useAuth()
  const { relationship } = useRelationship()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'stories', date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (relationship) load() }, [relationship])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('lore')
      .select('*, profiles:created_by(display_name)')
      .eq('relationship_id', relationship.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const { error } = await supabase.from('lore').insert({
      relationship_id: relationship.id,
      created_by: profile.id,
      title: form.title,
      description: form.description,
      category: form.category,
      date: form.date || null
    })
    setSaving(false)
    if (!error) {
      setShowForm(false)
      setForm({ title: '', description: '', category: 'stories', date: '' })
      load()
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lore entry?')) return
    await supabase.from('lore').delete().eq('id', id)
    load()
  }

  const filtered = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = filter === 'all' || e.category === filter
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Our Lore</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Wikipedia for your relationship</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add lore</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lore..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none">
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="The Shotgun 1v1 Saga" required />
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Date (optional)" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Add to lore</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Every relationship has lore." description="Start documenting yours." actionLabel="Add lore" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] capitalize">{e.category}</span>
                  {e.created_by === profile.id && (
                    <button onClick={() => handleDelete(e.id)} className="text-xs text-[var(--color-text-muted)] hover:text-red-400">Delete</button>
                  )}
                </div>
                <h3 className="font-medium text-lg mb-2">{e.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] flex-1 whitespace-pre-wrap">{e.description}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-3">
                  {e.profiles?.display_name}{e.date ? ` · ${e.date}` : ''}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
