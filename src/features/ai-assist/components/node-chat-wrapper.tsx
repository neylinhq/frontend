import { useCallback, useEffect, useState } from 'react'
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession
} from '../model'
import { ChatHeader } from './chat-header'
import { NodeChatPanel } from './node-chat-panel'

interface NodeChatWrapperProps {
  nodeId: string
  mapId: string
}

export const NodeChatWrapper = ({ nodeId, mapId }: NodeChatWrapperProps) => {
  // Chat sessions state - filter by nodeId
  const { data: sessions = [], isLoading: sessionsLoading, isError } = useChatSessions(mapId, nodeId)
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
      !createSession.isPending &&
      !autoCreateAttempted
    ) {
      // Auto-create first session
      setAutoCreateAttempted(true)
      createSession.mutate(
        { contextType: 'node', nodeId },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }
  }, [sessions, activeSessionId, sessionsLoading, isError, createSession.isPending, autoCreateAttempted, nodeId])

  // Reset when nodeId changes
  useEffect(() => {
    setActiveSessionId(null)
    setAutoCreateAttempted(false)
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
    createSession.mutate(
      { contextType: 'node', nodeId },
      {
        onSuccess: session => {
          setActiveSessionId(session.id)
        }
      }
    )
  }, [createSession, nodeId])

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
        { contextType: 'node', nodeId },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }, 100)
  }, [sessions, deleteSession, createSession, nodeId])

  const handleCloseOthers = useCallback(() => {
    sessions
      .filter(s => s.id !== activeSessionId)
      .forEach(s => {
        deleteSession.mutate(s.id)
      })
  }, [sessions, activeSessionId, deleteSession])

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + T — new chat
      if (isMod && e.key === 't') {
        e.preventDefault()
        handleCreateSession()
        return
      }

      // Cmd/Ctrl + W — close current tab (only if more than 1 session)
      if (isMod && e.key === 'w' && !e.shiftKey && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        handleCloseSession(activeSessionId)
        return
      }

      // Cmd/Ctrl + Shift + W — close all tabs
      if (isMod && e.shiftKey && e.key === 'W') {
        e.preventDefault()
        handleCloseAll()
        return
      }

      // Cmd/Ctrl + [ or ] — switch tabs
      if (isMod && (e.key === '[' || e.key === ']') && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        const currentIndex = sessions.findIndex(s => s.id === activeSessionId)
        if (currentIndex === -1) return

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
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sessions, activeSessionId, handleCreateSession, handleCloseSession, handleCloseAll])

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
        isLoading={sessionsLoading || createSession.isPending}
        isMobile={false}
      />
      <div className='flex-1 overflow-hidden'>
        <NodeChatPanel nodeId={nodeId} mapId={mapId} sessionId={activeSessionId ?? undefined} />
      </div>
    </div>
  )
}
