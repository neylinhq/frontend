import { useTranslation } from 'react-i18next'
import { ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { cn } from '@/shared/lib/cn'
import type { ChatSession } from '../model/chat-sessions.types'
import { ChatSelectorPopover } from './chat-selector-popover'
import { useState } from 'react'

interface ChatSelectorRowProps {
  sessions: ChatSession[]
  activeSession: ChatSession | null
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  isLoading?: boolean
}

export const ChatSelectorRow = ({
  sessions,
  activeSession,
  onSelectSession,
  onCreateSession,
  isLoading
}: ChatSelectorRowProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (id: string) => {
    onSelectSession(id)
    setIsOpen(false)
  }

  const activeTitle = activeSession?.title || t('ai.chat.newChat', 'New chat')

  return (
    <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-background">
      {/* Chat selector with popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'justify-between h-6 px-2 w-fit max-w-[200px]',
              'text-xs font-normal',
              'hover:bg-muted/50'
            )}
            disabled={isLoading}
          >
            <span className="truncate text-left">{activeTitle}</span>
            <ChevronDown className={cn(
              'h-3 w-3 shrink-0 ml-1 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-0"
          align="start"
          sideOffset={4}
        >
          <ChatSelectorPopover
            sessions={sessions}
            activeSessionId={activeSession?.id || null}
            onSelectSession={handleSelect}
          />
        </PopoverContent>
      </Popover>

      {/* New chat button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 shrink-0"
        onClick={onCreateSession}
        disabled={isLoading}
        title={t('ai.chat.newChat', 'New chat')}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
