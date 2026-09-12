import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const RelationshipContext = createContext(null)

export function RelationshipProvider({ children }) {
  const { user } = useAuth()
  const [relationship, setRelationship] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    memories: 0, notes: 0, games: 0, lore: 0, daysTogether: 0,
  })

  const fetchRelationship = useCallback(async (opts = {}) => {
    const silent = opts.silent === true
    if (!user) {
      setRelationship(null)
      setMembers([])
      setLoading(false)
      return
    }
    if (!silent) setLoading(true)
    try {
      const { data: membership, error: memErr } = await supabase
        .from('relationship_members')
        .select('relationship_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (memErr) throw memErr
      if (!membership) {
        setRelationship(null)
        setMembers([])
        setLoading(false)
        return
      }

      const { data: rel, error: relErr } = await supabase
        .from('relationships')
        .select('*')
        .eq('id', membership.relationship_id)
        .single()
      if (relErr) throw relErr

      setRelationship(rel)

      const { data: mems } = await supabase
        .from('relationship_members')
        .select('*, profiles:user_id(id, display_name, username, avatar_url)')
        .eq('relationship_id', rel.id)
      setMembers(mems || [])

      try {
        const [memCount, noteCount, gameCount, loreCount] = await Promise.all([
          supabase.from('memories').select('id', { count: 'exact', head: true }).eq('relationship_id', rel.id),
          supabase.from('notes').select('id', { count: 'exact', head: true }).eq('relationship_id', rel.id),
          supabase.from('games').select('id', { count: 'exact', head: true }).eq('relationship_id', rel.id),
          supabase.from('lore').select('id', { count: 'exact', head: true }).eq('relationship_id', rel.id),
        ])
        let days = 0
        if (rel.relationship_start_date) {
          days = Math.max(0, Math.floor((Date.now() - new Date(rel.relationship_start_date)) / 86400000))
        }
        setStats({
          memories: memCount.count || 0,
          notes: noteCount.count || 0,
          games: gameCount.count || 0,
          lore: loreCount.count || 0,
          daysTogether: days,
        })
      } catch (_) {}
    } catch (err) {
      console.error('Error fetching relationship:', err)
      if (!opts.keepOnError) {
        setRelationship(null)
        setMembers([])
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRelationship()
  }, [fetchRelationship])

  async function createRelationship({ name, startDate, description }) {
    if (!user) throw new Error('Not authenticated')
    const code = 'LOVE-' + Math.random().toString(36).substring(2, 6).toUpperCase()

    const { data: rel, error } = await supabase
      .from('relationships')
      .insert({
        name: name || 'Us',
        description: description || null,
        invite_code: code,
        creator_id: user.id,
        relationship_start_date: startDate || null,
      })
      .select()
      .single()
    if (error) throw error

    const { error: joinErr } = await supabase
      .from('relationship_members')
      .insert({ relationship_id: rel.id, user_id: user.id })
    if (joinErr) throw joinErr

    setRelationship(rel)
    setMembers([{ relationship_id: rel.id, user_id: user.id }])
    await fetchRelationship({ silent: true, keepOnError: true })
    return rel
  }

  async function joinRelationship(inviteCode) {
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase.rpc('join_relationship_by_code', {
      p_invite_code: inviteCode.trim().toUpperCase(),
    })
    if (error) throw new Error(error.message || 'Invalid invitation code')

    const rel = Array.isArray(data) ? data[0] : data
    if (!rel) throw new Error('Invalid invitation code')

    setRelationship(rel)
    await fetchRelationship({ silent: true, keepOnError: true })
    return rel
  }

  const partner = members.find((m) => m.user_id !== user?.id)?.profiles || null

  return (
    <RelationshipContext.Provider
      value={{
        relationship,
        members,
        partner,
        stats,
        loading,
        createRelationship,
        joinRelationship,
        refreshRelationship: fetchRelationship,
        hasRelationship: !!relationship,
      }}
    >
      {children}
    </RelationshipContext.Provider>
  )
}

export function useRelationship() {
  const ctx = useContext(RelationshipContext)
  if (!ctx) throw new Error('useRelationship must be used within RelationshipProvider')
  return ctx
}
