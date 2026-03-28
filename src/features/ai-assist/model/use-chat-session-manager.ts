import { useCallback, useEffect, useState } from 'react'

import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession
} from './ai-assist.sessions.hooks'
import { useChatHistoryStore } from './ai-assist.chat.store'

interface UseChatSessionManagerParams {
  mapId: string
  nodeId?: string
  isOpen?: boolean
}

export const useChatSessionManager = ({ mapId, nodeId, isOpen = true }: UseChatSessionManagerParams) => {
  const contextType = nodeId ? 'node' : 'map'
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isError
  } = useChatSessions(mapId, nodeId)
  const createSession = useCreateChatSession(mapId)
  const renameSession = useRenameChatSession(mapId)
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
      isOpen &&
      !createSession.isPending &&
      !autoCreateAttempted
    ) {
      setAutoCreateAttempted(true)
      createSession.mutate(
        { contextType, nodeId },
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
    isOpen,
    createSession.isPending,
    autoCreateAttempted,
    contextType,
    nodeId
  ])

  // Reset when nodeId changes (for node-scoped sessions)
  useEffect(() => {
    if (nodeId) {
      setActiveSessionId(null)
      setAutoCreateAttempted(false)
    }
  }, [nodeId])

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

  const handleCreateSession = useCallback(() => {
    if (activeSessionId) {
      const currentMessages = useChatHistoryStore.getState().sessions[activeSessionId]?.messages
      if (!currentMessages || currentMessages.length === 0) {
        return
      }
    }
    createSession.mutate(
      { contextType, nodeId },
      {
        onSuccess: session => {
          setActiveSessionId(session.id)
        }
      }
    )
  }, [createSession, contextType, nodeId, activeSessionId])

  const handleRenameSession = useCallback(
    (sessionId: string, title: string) => {
      renameSession.mutate({ sessionId, title })
    },
    [renameSession]
  )

  const handleCloseAll = useCallback(() => {
    sessions.forEach(s => {
      deleteSession.mutate(s.id)
    })
    setTimeout(() => {
      createSession.mutate(
        { contextType, nodeId },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }, 100)
  }, [sessions, deleteSession, createSession, contextType, nodeId])

  const handleCloseOthers = useCallback(() => {
    sessions
      .filter(s => s.id !== activeSessionId)
      .forEach(s => {
        deleteSession.mutate(s.id)
      })
  }, [sessions, activeSessionId, deleteSession])

  const handleNextTab = useCallback(() => {
    if (sessions.length <= 1 || !activeSessionId) return
    const currentIndex = sessions.findIndex(s => s.id === activeSessionId)
    if (currentIndex === -1) return
    const newIndex = currentIndex === sessions.length - 1 ? 0 : currentIndex + 1
    setActiveSessionId(sessions[newIndex].id)
  }, [sessions, activeSessionId])

  const handlePrevTab = useCallback(() => {
    if (sessions.length <= 1 || !activeSessionId) return
    const currentIndex = sessions.findIndex(s => s.id === activeSessionId)
    if (currentIndex === -1) return
    const newIndex = currentIndex === 0 ? sessions.length - 1 : currentIndex - 1
    setActiveSessionId(sessions[newIndex].id)
  }, [sessions, activeSessionId])

  return {
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    isCreating: createSession.isPending,
    handleCreateSession,
    handleCloseSession,
    handleRenameSession,
    handleCloseAll,
    handleCloseOthers,
    handleNextTab,
    handlePrevTab
  }
}
