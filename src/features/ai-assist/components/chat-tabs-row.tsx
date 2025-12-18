import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, X } from 'lucide-react'
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

  if (sessions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/30">
      {/* Scrollable tabs - hidden scrollbar */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sessions.map(session => {
          const isActive = session.id === activeSessionId
          const isEditing = editing?.sessionId === session.id

          return (
            <div
              key={session.id}
              data-session-id={session.id}
              className={cn(
                'group relative flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer',
                'border-r border-border/50 min-w-[80px] max-w-[160px]',
                'transition-all',
                isActive
                  ? 'bg-background opacity-100'
                  : 'opacity-60 hover:opacity-80 hover:bg-muted/30'
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
                  className="w-full bg-transparent outline-none text-xs"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className={cn(
                      'truncate flex-1',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    onDoubleClick={() => handleDoubleClick(session)}
                    title={getSessionTitle(session)}
                  >
                    {getSessionTitle(session)}
                  </span>

                  {/* Close button - appears on hover */}
                  {sessions.length > 1 && (
                    <button
                      className={cn(
                        'shrink-0 p-0.5 rounded-sm',
                        'text-muted-foreground hover:text-foreground hover:bg-muted',
                        'opacity-0 group-hover:opacity-100 transition-opacity'
                      )}
                      onClick={e => {
                        e.stopPropagation()
                        onCloseSession(session.id)
                      }}
                      aria-label={t('ai.chat.closeTab', 'Close tab')}
                    >
                      <X className="h-3 w-3" />
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
            className="h-7 w-7 shrink-0 mx-1"
            aria-label={t('ai.chat.menu', 'Chat options')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 text-xs">
          <DropdownMenuItem
            onClick={() => activeSessionId && onCloseSession(activeSessionId)}
            disabled={sessions.length <= 1 || !activeSessionId}
            className="text-xs py-1.5"
          >
            {t('ai.chat.closeTab', 'Close tab')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCloseOthers}
            disabled={sessions.length <= 1}
            className="text-xs py-1.5"
          >
            {t('ai.chat.closeOthers', 'Close other tabs')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCloseAll}
            disabled={sessions.length === 0}
            className="text-xs py-1.5"
          >
            {t('ai.chat.closeAll', 'Close all tabs')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs py-1.5">
            {t('ai.chat.exportChat', 'Export chat')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
