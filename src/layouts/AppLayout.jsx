import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Image, Gamepad2, MessageSquare, BookOpen, Clock, Sparkles, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRelationship } from '../contexts/RelationshipContext'
import { Avatar } from '../components/ui/Avatar'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/memories', icon: Image, label: 'Memories' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/notes', icon: MessageSquare, label: 'Notes' },
  { to: '/lore', icon: BookOpen, label: 'Lore' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/wrapped', icon: Sparkles, label: 'Wrapped' },
]

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const { relationship } = useRelationship()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 fixed h-full">
        <div className="p-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
            <span className="text-[var(--color-accent)] font-semibold text-sm">R</span>
          </div>
          <div>
            <div className="font-medium text-sm">Relationship OS</div>
            <div className="text-xs text-[var(--color-text-muted)] truncate max-w-[140px]">{relationship?.name || 'Your space'}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--color-border)] space-y-0.5">
          <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5">
            <Avatar src={profile?.avatar_url} name={profile?.display_name} size="sm" />
            <span className="truncate">{profile?.display_name}</span>
          </NavLink>
          <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5">
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around py-2 z-50 safe-area-pb">
        {navItems.slice(0, 5).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
