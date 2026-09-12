import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Plus, Check, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

const GAME_TYPES = [
  { id: 'how_well', name: 'How Well Do You Know Me?', desc: 'Answer as yourself. Partner predicts your answer.' },
  { id: 'assumptions', name: 'Assumptions', desc: 'Make an assumption. Partner says True / False / Maybe.' },
  { id: 'who_said_it', name: 'Who Said It?', desc: 'Submit a quote. Partner guesses who said it.' },
  { id: 'this_or_that', name: 'This or That', desc: 'Pick between two options. Partner guesses your pick.' },
  { id: 'would_you_rather', name: 'Would You Rather', desc: 'Two options. You choose, they predict.' },
]

export default function Games() {
  const { profile, user } = useAuth()
  const { relationship, partner } = useRelationship()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('hub') // hub | create | play
  const [selectedType, setSelectedType] = useState(null)
  const [activeGame, setActiveGame] = useState(null)
  const [responses, setResponses] = useState([])
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (relationship) loadGames() }, [relationship])

  async function loadGames() {
    setLoading(true)
    const { data } = await supabase
      .from('games')
      .select('*, profiles:created_by(display_name)')
      .eq('relationship_id', relationship.id)
      .order('created_at', { ascending: false })
    setGames(data || [])
    setLoading(false)
  }

  async function createGame() {
    if (!selectedType) return
    setSaving(true)
    let dataPayload = {}
    if (selectedType === 'how_well' || selectedType === 'this_or_that' || selectedType === 'would_you_rather') {
      dataPayload = { question: form.question, options: form.options || [] }
    } else if (selectedType === 'assumptions') {
      dataPayload = { assumption: form.assumption }
    } else if (selectedType === 'who_said_it') {
      dataPayload = { quote: form.quote }
    }
    const { data, error } = await supabase.from('games').insert({
      relationship_id: relationship.id,
      game_type: selectedType,
      created_by: profile.id,
      status: 'waiting',
      data: dataPayload
    }).select().single()
    setSaving(false)
    if (!error && data) {
      // if creator answers immediately for some types
      if (['how_well', 'this_or_that', 'would_you_rather'].includes(selectedType) && form.myAnswer) {
        await supabase.from('game_responses').insert({
          game_id: data.id,
          user_id: profile.id,
          answer: form.myAnswer,
          data: { role: 'answer' }
        })
      }
      setView('hub')
      setSelectedType(null)
      setForm({})
      loadGames()
    }
  }

  async function openGame(game) {
    setActiveGame(game)
    const { data } = await supabase.from('game_responses').select('*').eq('game_id', game.id)
    setResponses(data || [])
    setView('play')
  }

  async function submitResponse(answer, extra = {}) {
    if (!activeGame) return
    setSaving(true)
    await supabase.from('game_responses').upsert({
      game_id: activeGame.id,
      user_id: profile.id,
      answer,
      data: extra
    }, { onConflict: 'game_id,user_id' })
    // check if both responded -> complete
    const { data: all } = await supabase.from('game_responses').select('*').eq('game_id', activeGame.id)
    if (all && all.length >= 2) {
      await supabase.from('games').update({ status: 'completed' }).eq('id', activeGame.id)
    }
    setSaving(false)
    openGame(activeGame)
    loadGames()
  }

  const myResponse = responses.find(r => r.user_id === profile.id)
  const partnerResponse = responses.find(r => r.user_id !== profile.id)

  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-lg">
        <Button variant="ghost" onClick={() => { setView('hub'); setSelectedType(null) }}>← Back</Button>
        <h1 className="text-2xl font-semibold">New game</h1>
        {!selectedType ? (
          <div className="space-y-3">
            {GAME_TYPES.map(g => (
              <Card key={g.id} hover onClick={() => setSelectedType(g.id)} className="text-left">
                <h3 className="font-medium">{g.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{g.desc}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="space-y-4">
            <h2 className="font-medium">{GAME_TYPES.find(g => g.id === selectedType)?.name}</h2>
            {selectedType === 'assumptions' && (
              <Textarea label="Your assumption" value={form.assumption || ''} onChange={e => setForm({ assumption: e.target.value })}
                placeholder="I assume you would survive a zombie apocalypse longer than me." />
            )}
            {selectedType === 'who_said_it' && (
              <Textarea label="The quote / statement" value={form.quote || ''} onChange={e => setForm({ quote: e.target.value })}
                placeholder="Something funny one of you said..." />
            )}
            {(selectedType === 'how_well' || selectedType === 'this_or_that' || selectedType === 'would_you_rather') && (
              <>
                <Input label="Question" value={form.question || ''} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  placeholder={selectedType === 'how_well' ? 'What would I choose for a perfect Saturday?' : 'Option A or Option B?'} />
                {selectedType !== 'how_well' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Option A" value={form.optA || ''} onChange={e => setForm(f => ({ ...f, optA: e.target.value, options: [e.target.value, f.optB || ''] }))} />
                    <Input label="Option B" value={form.optB || ''} onChange={e => setForm(f => ({ ...f, optB: e.target.value, options: [f.optA || '', e.target.value] }))} />
                  </div>
                )}
                <Input label="Your answer (hidden from them)" value={form.myAnswer || ''} onChange={e => setForm(f => ({ ...f, myAnswer: e.target.value }))} />
              </>
            )}
            <div className="flex gap-2">
              <Button onClick={createGame} loading={saving}>Start game</Button>
              <Button variant="ghost" onClick={() => setSelectedType(null)}>Back</Button>
            </div>
          </Card>
        )}
      </div>
    )
  }

  if (view === 'play' && activeGame) {
    const type = activeGame.game_type
    const bothDone = myResponse && partnerResponse
    return (
      <div className="space-y-6 max-w-lg">
        <Button variant="ghost" onClick={() => { setView('hub'); setActiveGame(null) }}>← Back</Button>
        <h1 className="text-2xl font-semibold">{GAME_TYPES.find(g => g.id === type)?.name || type}</h1>
        <Card className="space-y-4">
          {type === 'assumptions' && (
            <>
              <p className="text-lg">"{activeGame.data?.assumption}"</p>
              {!myResponse ? (
                <div className="flex gap-2">
                  <Button onClick={() => submitResponse('True')}>True</Button>
                  <Button variant="secondary" onClick={() => submitResponse('False')}>False</Button>
                  <Button variant="ghost" onClick={() => submitResponse('Maybe')}>Maybe</Button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>Your answer: <strong>{myResponse.answer}</strong></p>
                  {partnerResponse ? <p>Their answer: <strong>{partnerResponse.answer}</strong></p> : <p className="text-[var(--color-text-muted)]">Waiting for partner...</p>}
                </div>
              )}
            </>
          )}
          {type === 'who_said_it' && (
            <>
              <p className="text-lg italic">"{activeGame.data?.quote}"</p>
              {!myResponse ? (
                <div className="flex gap-2">
                  <Button onClick={() => submitResponse(profile.display_name)}>I said it</Button>
                  <Button variant="secondary" onClick={() => submitResponse(partner?.display_name || 'Them')}>They said it</Button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>Your guess: <strong>{myResponse.answer}</strong></p>
                  {partnerResponse ? <p>Their guess: <strong>{partnerResponse.answer}</strong></p> : <p className="text-[var(--color-text-muted)]">Waiting...</p>}
                </div>
              )}
            </>
          )}
          {(type === 'how_well' || type === 'this_or_that' || type === 'would_you_rather') && (
            <>
              <p className="text-lg">{activeGame.data?.question}</p>
              {activeGame.data?.options?.length > 0 && (
                <p className="text-sm text-[var(--color-text-secondary)]">{activeGame.data.options.join('  vs  ')}</p>
              )}
              {!myResponse ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {activeGame.created_by === profile.id ? 'You already answered when creating. Waiting for prediction.' : 'Predict their answer:'}
                  </p>
                  {activeGame.created_by !== profile.id && (
                    <Input value={form.predict || ''} onChange={e => setForm({ predict: e.target.value })} placeholder="What would they say?" />
                  )}
                  {activeGame.created_by !== profile.id && (
                    <Button onClick={() => submitResponse(form.predict)} disabled={!form.predict} loading={saving}>Submit prediction</Button>
                  )}
                  {activeGame.created_by === profile.id && !partnerResponse && (
                    <p className="text-[var(--color-text-muted)]">Waiting for their prediction...</p>
                  )}
                </div>
              ) : bothDone ? (
                <div className="space-y-3 text-sm border-t border-[var(--color-border)] pt-4">
                  <p>Creator's answer: <strong>{responses.find(r => r.user_id === activeGame.created_by)?.answer}</strong></p>
                  <p>Prediction: <strong>{responses.find(r => r.user_id !== activeGame.created_by)?.answer}</strong></p>
                  <p className="flex items-center gap-2">
                    {responses.find(r => r.user_id === activeGame.created_by)?.answer?.toLowerCase() ===
                     responses.find(r => r.user_id !== activeGame.created_by)?.answer?.toLowerCase()
                      ? <><Check className="w-4 h-4 text-green-400" /> Correct!</>
                      : <><X className="w-4 h-4 text-red-400" /> Not quite</>}
                  </p>
                </div>
              ) : (
                <p className="text-[var(--color-text-muted)]">Waiting for both answers...</p>
              )}
            </>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Games</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Play together</p>
        </div>
        <Button onClick={() => setView('create')}><Plus className="w-4 h-4" /> New game</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : games.length === 0 ? (
        <EmptyState icon={Gamepad2} title="No games yet." description="Start one and see how well you know each other." actionLabel="New game" onAction={() => setView('create')} />
      ) : (
        <div className="space-y-3">
          {games.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card hover onClick={() => openGame(g)} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{GAME_TYPES.find(t => t.id === g.game_type)?.name || g.game_type}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    by {g.profiles?.display_name} · {g.status} · {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${g.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'}`}>
                  {g.status}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
