import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

export default function Timeline() {
  const { profile } = useAuth()
  const { relationship } = useRelationship()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (relationship) load() }, [relationship])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('timeline_events')
      .select('*, profiles:created_by(display_name)')
      .eq('relationship_id', relationship.id)
      .order('event_date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('timeline_events').insert({
      relationship_id: relationship.id,
      created_by: profile.id,
      title: form.title,
      description: form.description,
      event_date: form.event_date
    })
    setSaving(false)
    setShowForm(false)
    setForm({ title: '', description: '', event_date: '' })
    load()
  }

  // group by year
  const byYear = events.reduce((acc, e) => {
    const y = e.event_date ? new Date(e.event_date).getFullYear() : 'Unknown'
    if (!acc[y]) acc[y] = []
    acc[y].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Timeline</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Your chapters together</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add event</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input label="Date" type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} required />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Add</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-6">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState icon={Clock} title="Nothing here yet." description="Add your first chapter." actionLabel="Add event" onAction={() => setShowForm(true)} />
      ) : (
        <div className="relative pl-6 border-l border-[var(--color-border)] space-y-10">
          {Object.entries(byYear).sort((a,b) => Number(b[0]) - Number(a[0])).map(([year, list]) => (
            <div key={year}>
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
              </div>
              <h2 className="text-lg font-semibold mb-4 -mt-1">{year}</h2>
              <div className="space-y-4">
                {list.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <div className="text-xs text-[var(--color-text-muted)] mb-1">{e.event_date}</div>
                      <h3 className="font-medium">{e.title}</h3>
                      {e.description && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{e.description}</p>}
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">{e.profiles?.display_name}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
