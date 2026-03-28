import { SearchMdIcon, Trash01Icon } from '@untitledui/icons-react/outline'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/shared/components/input'
import { cn } from '@/shared/lib/cn'

import type { ChatSession } from '../model/ai-assist.sessions.types'

interface ChatSelectorPopoverProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onDeleteSession?: (id: string) => void
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
  onSelectSession,
  onDeleteSession
}: ChatSelectorPopoverProps) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions
    const query = search.toLowerCase()
    return sessions.filter(s => (s.title || '').toLowerCase().includes(query))
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
    <div className='flex flex-col max-h-80 bg-background p-2'>
      {/* Search input */}
      <div className='pb-2'>
        <div className='relative'>
          <SearchMdIcon className='absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground' />
          <Input
            type='text'
            placeholder={t('ai.chat.searchChats', 'Search chats...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 pl-7 text-xs bg-muted/30 border-border/60 rounded-sm'
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className='flex-1 overflow-y-auto space-y-1.5'>
        {groupedSessions.length === 0 ? (
          <div className='px-2 py-3 text-center text-xs text-muted-foreground'>
            {search
              ? t('ai.chat.noSearchResults', 'No chats found')
              : t('ai.chat.noChats', 'No chats yet')}
          </div>
        ) : (
          groupedSessions.map(group => (
            <div key={group.label} className='space-y-0'>
              {/* Group header */}
              {/* <div className='px-2 mb-0.75 text-2xs font-medium tracking-wide text-muted-foreground uppercase'>
                {group.label}
              </div> */}
              {/* Group items */}
              <div className='space-y-0.5'>
                {group.sessions.map(session => {
                  const isActive = session.id === activeSessionId
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        'group w-full px-2 py-1 text-xs text-left rounded-xs flex items-center gap-1 cursor-pointer',
                        'hover:bg-[var(--surface-hover)] transition-colors',
                        isActive
                          ? 'bg-muted/60 text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <span className='truncate flex-1'>{getSessionTitle(session)}</span>
                      {onDeleteSession && (
                        <button
                          type='button'
                          tabIndex={-1}
                          className='shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded-xs text-muted-foreground hover:text-destructive transition-all'
                          onClick={e => {
                            e.stopPropagation()
                            onDeleteSession(session.id)
                          }}
                        >
                          <Trash01Icon className='h-3 w-3' />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
