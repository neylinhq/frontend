import { memo, useCallback, useEffect, useState } from 'react'

import {
  MapChatPanel,
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession
} from '@/features/ai-assist'

import { useChatActionsStore } from '../model'

interface ChatPanelProps {
  mapId: string
}

export const ChatPanel = memo(function ChatPanel({ mapId }: ChatPanelProps) {
  const { data: sessions = [], isLoading: sessionsLoading, isError } = useChatSessions(mapId)
  const createSession = useCreateChatSession(mapId)
  const deleteSession = useDeleteChatSession(mapId)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false)

  // Auto-select first session or create one if none exist
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
      setAutoCreateAttempted(false)
    } else if (
      sessions.length === 0 &&
      !sessionsLoading &&
      !isError &&
      !createSession.isPending &&
      !autoCreateAttempted
    ) {
      setAutoCreateAttempted(true)
      createSession.mutate(
        { contextType: 'map' },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }
  }, [
    sessions,
    activeSessionId,
    sessionsLoading,
    isError,
    createSession.isPending,
    createSession.mutate,
    autoCreateAttempted
  ])

  const handleCreateSession = useCallback(() => {
    createSession.mutate(
      { contextType: 'map' },
      {
        onSuccess: session => {
          setActiveSessionId(session.id)
        }
      }
    )
  }, [createSession])

  const handleCloseSession = useCallback(
    (sessionId: string) => {
      deleteSession.mutate(sessionId, {
        onSuccess: () => {
          if (activeSessionId === sessionId) {
            const remaining = sessions.filter(s => s.id !== sessionId)
            setActiveSessionId(remaining[0]?.id || null)
          }
        }
      })
    },
    [deleteSession, activeSessionId, sessions]
  )

  // Sync session data + actions to the shell header store
  useEffect(() => {
    useChatActionsStore.setState({
      createSession: handleCreateSession,
      sessions,
      activeSessionId,
      selectSession: setActiveSessionId,
      deleteSession: handleCloseSession
    })
  }, [handleCreateSession, sessions, activeSessionId, handleCloseSession])

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 't') {
        e.preventDefault()
        handleCreateSession()
        return
      }

      if (isMod && e.key === 'w' && !e.shiftKey && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        handleCloseSession(activeSessionId)
        return
      }

      if (isMod && (e.key === '[' || e.key === ']') && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        const currentIndex = sessions.findIndex(s => s.id === activeSessionId)
        if (currentIndex === -1) {
          return
        }

        let newIndex: number
        if (e.key === '[') {
          newIndex = currentIndex === 0 ? sessions.length - 1 : currentIndex - 1
        } else {
          newIndex = currentIndex === sessions.length - 1 ? 0 : currentIndex + 1
        }
        setActiveSessionId(sessions[newIndex].id)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sessions, activeSessionId, handleCreateSession, handleCloseSession])

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex-1 overflow-hidden'>
        <MapChatPanel mapId={mapId} sessionId={activeSessionId} />
      </div>
    </div>
  )
})
