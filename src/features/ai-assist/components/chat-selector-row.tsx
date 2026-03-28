import { ChevronDownIcon, DotsHorizontalIcon, PlusIcon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { cn } from '@/shared/lib/cn'

import type { ChatSession } from '../model/ai-assist.sessions.types'
import { ChatSelectorPopover } from './chat-selector-popover'

interface ChatSelectorRowProps {
  sessions: ChatSession[]
  activeSession: ChatSession | null
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  /** Delete the currently active session */
  onDeleteCurrentSession?: () => void
  /** Delete a specific session by id (for popover list) */
  onDeleteSession?: (id: string) => void
  onCloseAll?: () => void
  onCloseOthers?: () => void
  isLoading?: boolean
  /** Controlled open state for Cmd+K shortcut */
  open?: boolean
  /** Controlled open change handler */
  onOpenChange?: (open: boolean) => void
  className?: string
}

export const ChatSelectorRow = ({
  sessions,
  activeSession,
  onSelectSession,
  onCreateSession,
  onDeleteCurrentSession,
  onDeleteSession,
  onCloseAll,
  onCloseOthers,
  isLoading,
  open: controlledOpen,
  onOpenChange,
  className
}: ChatSelectorRowProps) => {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)

  // Support both controlled and uncontrolled modes
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }

  const handleSelect = (id: string) => {
    onSelectSession(id)
    setIsOpen(false)
  }

  const activeTitle = activeSession?.title || t('ai.chat.newChat', 'New chat')

  const canCloseAll = !!onCloseAll && sessions.length > 0
  const canCloseOthers = !!onCloseOthers && sessions.length > 1 && !!activeSession

  return (
    <div
      className={cn('flex items-center justify-between gap-2 px-2.5 py-1 bg-background', className)}
    >
      {/* Chat selector with popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className={cn(
              'h-6 px-0 w-fit max-w-60',
              'text-xs font-medium text-foreground/90',
              'hover:bg-transparent hover:text-foreground',
              'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0'
            )}
            disabled={isLoading}
          >
            <span className='truncate text-left'>{activeTitle}</span>
            <ChevronDownIcon
              className={cn(
                'h-3 w-3 shrink-0 ml-1 text-muted-foreground/70 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-72 p-0 rounded-lg border-border/60 bg-background overflow-hidden'
          align='start'
          sideOffset={6}
        >
          <ChatSelectorPopover
            sessions={sessions}
            activeSessionId={activeSession?.id || null}
            onSelectSession={handleSelect}
            onDeleteSession={onDeleteSession}
          />
        </PopoverContent>
      </Popover>

      {/* New chat button */}
      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'h-6 w-6 shrink-0 rounded-xs',
            'text-muted-foreground',
            'hover:text-foreground hover:bg-[var(--surface-hover)]',
            'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0'
          )}
          onClick={onCreateSession}
          disabled={isLoading}
          aria-label={t('ai.chat.newChat', 'New chat')}
        >
          <PlusIcon className='h-2.5 w-2.5' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'h-6 w-6 shrink-0 rounded-xs',
                'text-muted-foreground',
                'hover:text-foreground hover:bg-[var(--surface-hover)]',
                'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0'
              )}
              disabled={isLoading}
              aria-label={t('common.menu', 'Menu')}
            >
              <DotsHorizontalIcon className='h-2.5 w-2.5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='rounded-lg p-1.5'>
            <DropdownMenuItem onClick={onCreateSession} disabled={isLoading} className='text-xs'>
              {t('ai.chat.newChat', 'New chat')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className='my-0.5' />
            <DropdownMenuItem
              onClick={onCloseOthers}
              disabled={!canCloseOthers}
              className='text-xs'
            >
              {t('ai.chat.closeOthers', 'Close others')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCloseAll} disabled={!canCloseAll} className='text-xs'>
              {t('ai.chat.closeAll', 'Delete all chats')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className='my-0.5' />
            <DropdownMenuItem
              onClick={onDeleteCurrentSession}
              disabled={!onDeleteCurrentSession}
              className='text-xs text-destructive data-[highlighted]:text-destructive'
            >
              {t('ai.chat.deleteCurrent', 'Delete current chat')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
