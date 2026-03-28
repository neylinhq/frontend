import { memo, useEffect } from 'react'

import { ChatPanel as AIChatPanel, useChatKeyboardShortcuts, useChatSessionManager } from '@/features/ai-assist'

import { useChatActionsStore } from '../model'

interface ChatPanelProps {
  mapId: string
}

export const ChatPanel = memo(function ChatPanel({ mapId }: ChatPanelProps) {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    handleCreateSession,
    handleCloseSession,
    handleNextTab,
    handlePrevTab
  } = useChatSessionManager({ mapId })

  useChatKeyboardShortcuts({
    canCloseCurrent: sessions.length > 1 && !!activeSessionId,
    onCreateSession: handleCreateSession,
    onCloseSession: () => activeSessionId && handleCloseSession(activeSessionId),
    onNextTab: handleNextTab,
    onPrevTab: handlePrevTab
  })

  useEffect(() => {
    useChatActionsStore.setState({
      createSession: handleCreateSession,
      sessions,
      activeSessionId,
      selectSession: setActiveSessionId,
      deleteSession: handleCloseSession
    })
  }, [handleCreateSession, sessions, activeSessionId, handleCloseSession, setActiveSessionId])

  useEffect(() => {
    return () => {
      useChatActionsStore.setState({
        createSession: null,
        sessions: [],
        activeSessionId: null,
        selectSession: null,
        deleteSession: null
      })
    }
  }, [])

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex-1 overflow-hidden'>
        <AIChatPanel scope='map' mapId={mapId} sessionId={activeSessionId} />
      </div>
    </div>
  )
})
