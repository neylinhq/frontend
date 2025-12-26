import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DotsHorizontalIcon, XCloseIcon } from '@untitledui/icons-react/outline'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import type { ChatSession } from '../model/ai-assist.sessions.types'

interface ChatTabsRowProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onCloseSession: (id: string) => void
  onCloseAll: () => void
  onCloseOthers: () => void
  onRenameSession: (id: string, title: string) => void
}

interface EditingState {
  sessionId: string
  value: string
}

export const ChatTabsRow = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  onCloseAll,
  onCloseOthers,
  onRenameSession
}: ChatTabsRowProps) => {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to active tab
  useEffect(() => {
    if (!activeSessionId || !scrollRef.current) return
    const activeTab = scrollRef.current.querySelector(`[data-session-id="${activeSessionId}"]`)
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeSessionId])

  // Focus input when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleDoubleClick = useCallback((session: ChatSession) => {
    setEditing({ sessionId: session.id, value: session.title || '' })
  }, [])

  const handleEditBlur = useCallback(() => {
    if (editing) {
      const trimmed = editing.value.trim()
      if (trimmed && trimmed !== sessions.find(s => s.id === editing.sessionId)?.title) {
        onRenameSession(editing.sessionId, trimmed)
      }
      setEditing(null)
    }
  }, [editing, sessions, onRenameSession])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditBlur()
    } else if (e.key === 'Escape') {
      setEditing(null)
    }
  }, [handleEditBlur])

  const getSessionTitle = (session: ChatSession) => {
    return session.title || t('ai.chat.newChat', 'New chat')
  }

  const getSessionShortLabel = (session: ChatSession, index: number) => {
    const title = getSessionTitle(session)
    const initials = title
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return initials || String(index + 1)
  }

  if (sessions.length === 0) {
    return null
  }

  return (
    <div className="flex h-11 items-center justify-between bg-muted/30 px-2.5">
      {/* Scrollable tabs - hidden scrollbar */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sessions.map((session, index) => {
          const isActive = session.id === activeSessionId
          const isEditing = editing?.sessionId === session.id

          return (
            <div
              key={session.id}
              data-session-id={session.id}
              title={getSessionTitle(session)}
              aria-label={getSessionTitle(session)}
              className={cn(
                'group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md cursor-pointer',
                'border border-transparent transition-colors',
                isEditing && 'w-40 justify-start px-2 border-border/60 bg-background',
                isActive
                  ? 'bg-background text-foreground border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
              onClick={() => !isEditing && onSelectSession(session.id)}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editing.value}
                  onChange={e => setEditing({ ...editing, value: e.target.value })}
                  onBlur={handleEditBlur}
                  onKeyDown={handleEditKeyDown}
                  className="w-full bg-transparent text-xs font-medium outline-none"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className="text-xs font-semibold tracking-wide"
                    onDoubleClick={() => handleDoubleClick(session)}
                  >
                    {getSessionShortLabel(session, index)}
                  </span>

                  {/* Close button - appears on hover */}
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      className={cn(
                        'absolute -top-1 -right-1 rounded-full p-0.5',
                        'border border-border/60 bg-background',
                        'text-muted-foreground hover:text-foreground',
                        'opacity-0 group-hover:opacity-100 transition-opacity'
                      )}
                      onClick={e => {
                        e.stopPropagation()
                        onCloseSession(session.id)
                      }}
                      aria-label={t('ai.chat.closeTab', 'Close tab')}
                    >
                      <XCloseIcon className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Menu button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 shrink-0 mx-1 rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-background/60'
            )}
            aria-label={t('ai.chat.menu', 'Chat options')}
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => activeSessionId && onCloseSession(activeSessionId)}
            disabled={sessions.length <= 1 || !activeSessionId}
          >
            {t('ai.chat.closeTab', 'Close tab')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCloseOthers}
            disabled={sessions.length <= 1}
          >
            {t('ai.chat.closeOthers', 'Close other tabs')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCloseAll}
            disabled={sessions.length === 0}
          >
            {t('ai.chat.closeAll', 'Close all tabs')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {t('ai.chat.exportChat', 'Export chat')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
