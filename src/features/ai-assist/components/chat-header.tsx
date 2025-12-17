import type { ChatSession } from '../model/chat-sessions.types'
import { ChatTabsRow } from './chat-tabs-row'
import { ChatSelectorRow } from './chat-selector-row'

interface ChatHeaderProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  onCloseSession: (id: string) => void
  onCloseAll: () => void
  onCloseOthers: () => void
  onRenameSession: (id: string, title: string) => void
  isLoading?: boolean
  isMobile?: boolean
}

export const ChatHeader = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onCloseSession,
  onCloseAll,
  onCloseOthers,
  onRenameSession,
  isLoading,
  isMobile
}: ChatHeaderProps) => {
  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  return (
    <div className="flex flex-col shrink-0">
      {/* Row 1: Tabs (hidden on mobile) */}
      {!isMobile && (
        <ChatTabsRow
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onCloseSession={onCloseSession}
          onCloseAll={onCloseAll}
          onCloseOthers={onCloseOthers}
          onRenameSession={onRenameSession}
        />
      )}

      {/* Row 2: Selector + New button */}
      <ChatSelectorRow
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={onSelectSession}
        onCreateSession={onCreateSession}
        isLoading={isLoading}
      />
    </div>
  )
}
