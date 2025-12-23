import type { ChatSession } from '../model/ai-assist.sessions.types'
import { ChatSelectorRow } from './chat-selector-row'

interface ChatHeaderProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  // Props kept for future ChatTabsRow re-enablement
  onCloseSession?: (id: string) => void
  onCloseAll?: () => void
  onCloseOthers?: () => void
  onRenameSession?: (id: string, title: string) => void
  isLoading?: boolean
  isMobile?: boolean
  /** Controlled selector open state for Cmd+K */
  selectorOpen?: boolean
  /** Controlled selector open change handler */
  onSelectorOpenChange?: (open: boolean) => void
}

export const ChatHeader = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onCloseAll,
  onCloseOthers,
  isLoading,
  selectorOpen,
  onSelectorOpenChange
}: ChatHeaderProps) => {
  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  return (
    <div className="flex flex-col shrink-0 bg-background border-b border-border/60">
      <ChatSelectorRow
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={onSelectSession}
        onCreateSession={onCreateSession}
        onCloseAll={onCloseAll}
        onCloseOthers={onCloseOthers}
        isLoading={isLoading}
        open={selectorOpen}
        onOpenChange={onSelectorOpenChange}
      />
    </div>
  )
}
