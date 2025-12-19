import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '@/shared/components/input'
import { cn } from '@/shared/lib/cn'
import type { ChatSession } from '../model/ai-assist.sessions.types'

interface ChatSelectorPopoverProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
}

interface GroupedSessions {
  label: string
  sessions: ChatSession[]
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

const isThisWeek = (date: Date): boolean => {
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)
  return date >= weekAgo && !isToday(date) && !isYesterday(date)
}

const isThisMonth = (date: Date): boolean => {
  const now = new Date()
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear() &&
    !isThisWeek(date) &&
    !isYesterday(date) &&
    !isToday(date)
  )
}

export const ChatSelectorPopover = ({
  sessions,
  activeSessionId,
  onSelectSession
}: ChatSelectorPopoverProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions
    const query = search.toLowerCase()
    return sessions.filter(
      s => (s.title || '').toLowerCase().includes(query)
    )
  }, [sessions, search])

  // Group sessions by date
  const groupedSessions = useMemo((): GroupedSessions[] => {
    const groups: GroupedSessions[] = []
    const today: ChatSession[] = []
    const yesterday: ChatSession[] = []
    const thisWeek: ChatSession[] = []
    const thisMonth: ChatSession[] = []
    const older: ChatSession[] = []

    for (const session of filteredSessions) {
      const date = new Date(session.createdAt)
      if (isToday(date)) {
        today.push(session)
      } else if (isYesterday(date)) {
        yesterday.push(session)
      } else if (isThisWeek(date)) {
        thisWeek.push(session)
      } else if (isThisMonth(date)) {
        thisMonth.push(session)
      } else {
        older.push(session)
      }
    }

    if (today.length > 0) {
      groups.push({ label: t('ai.chat.today', 'Today'), sessions: today })
    }
    if (yesterday.length > 0) {
      groups.push({ label: t('ai.chat.yesterday', 'Yesterday'), sessions: yesterday })
    }
    if (thisWeek.length > 0) {
      groups.push({ label: t('ai.chat.thisWeek', 'This week'), sessions: thisWeek })
    }
    if (thisMonth.length > 0) {
      groups.push({ label: t('ai.chat.thisMonth', 'This month'), sessions: thisMonth })
    }
    if (older.length > 0) {
      groups.push({ label: t('ai.chat.older', 'Older'), sessions: older })
    }

    return groups
  }, [filteredSessions, t])

  const getSessionTitle = (session: ChatSession) => {
    return session.title || t('ai.chat.newChat', 'New chat')
  }

  return (
    <div className="flex flex-col max-h-[320px]">
      {/* Search input */}
      <div className="p-1.5 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('ai.chat.searchChats', 'Search chats...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto">
        {groupedSessions.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground">
            {search
              ? t('ai.chat.noSearchResults', 'No chats found')
              : t('ai.chat.noChats', 'No chats yet')}
          </div>
        ) : (
          groupedSessions.map(group => (
            <div key={group.label}>
              {/* Group header */}
              <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground bg-muted/30">
                {group.label}
              </div>
              {/* Group items */}
              {group.sessions.map(session => {
                const isActive = session.id === activeSessionId
                return (
                  <button
                    key={session.id}
                    className={cn(
                      'w-full px-2 py-1.5 text-xs text-left truncate',
                      'hover:bg-muted/50 transition-colors',
                      isActive
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => onSelectSession(session.id)}
                  >
                    {getSessionTitle(session)}
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
