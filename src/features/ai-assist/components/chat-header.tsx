import type { ChatSession } from '../model/chat-sessions.types'
import { ChatTabsRow } from './chat-tabs-row'
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
  onCloseSession,
  onCloseAll,
  onCloseOthers,
  onRenameSession,
  isLoading,
  isMobile,
  selectorOpen,
  onSelectorOpenChange
}: ChatHeaderProps) => {
  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  // Smart Tabs: show tabs only when multiple chats exist (Progressive Disclosure)
  const showTabs = !isMobile && sessions.length > 1

  return (
    <div className="flex flex-col shrink-0">
      {/* Row 1: Tabs - shown only when >1 chat exists */}
      {showTabs && (
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

      {/* Row 2: Selector + New button (always visible) */}
      <ChatSelectorRow
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={onSelectSession}
        onCreateSession={onCreateSession}
        isLoading={isLoading}
        open={selectorOpen}
        onOpenChange={onSelectorOpenChange}
      />
    </div>
  )
}
