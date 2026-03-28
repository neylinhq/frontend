import { useEffect } from 'react'

import { useStreamingStore } from '../model/ai-assist.streaming.store'
import { useChatKeyboardShortcuts } from '../model/use-chat-keyboard-shortcuts'
import { useChatSessionManager } from '../model/use-chat-session-manager'
import { ChatHeader } from './chat-header'
import { ChatPanel } from './chat-panel'

interface NodeChatWrapperProps {
  nodeId: string
  mapId: string
}

export const NodeChatWrapper = ({ nodeId, mapId }: NodeChatWrapperProps) => {
  const {
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    isCreating,
    handleCreateSession,
    handleCloseSession,
    handleRenameSession,
    handleCloseAll,
    handleCloseOthers,
    handleNextTab,
    handlePrevTab
  } = useChatSessionManager({ mapId, nodeId })

  const clearAll = useStreamingStore(s => s.clearAll)
  useEffect(() => {
    return () => clearAll()
  }, [clearAll])

  useChatKeyboardShortcuts({
    canCloseCurrent: sessions.length > 1 && !!activeSessionId,
    onCreateSession: handleCreateSession,
    onCloseSession: () => activeSessionId && handleCloseSession(activeSessionId),
    onCloseAll: handleCloseAll,
    onNextTab: handleNextTab,
    onPrevTab: handlePrevTab
  })

  return (
    <div className='flex h-full flex-col'>
      <ChatHeader
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onCloseSession={handleCloseSession}
        onCloseAll={handleCloseAll}
        onCloseOthers={handleCloseOthers}
        onRenameSession={handleRenameSession}
        isLoading={sessionsLoading || isCreating}
        isMobile={false}
      />
      <div className='flex-1 overflow-hidden'>
        {activeSessionId ? (
          <ChatPanel scope='node' nodeId={nodeId} mapId={mapId} sessionId={activeSessionId} />
        ) : null}
      </div>
    </div>
  )
}
