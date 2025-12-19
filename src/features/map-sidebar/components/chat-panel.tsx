import { memo, useCallback, useEffect, useState } from 'react'
import { useChatSessions, useCreateChatSession, useDeleteChatSession, useRenameChatSession } from '@/features/ai-assist/model'
import { ChatHeader } from '@/features/ai-assist/components/chat-header'
import { MapChatPanel } from '@/features/ai-assist/components/map-chat-panel'

interface ChatPanelProps {
  mapId: string
}

export const ChatPanel = memo(function ChatPanel({ mapId }: ChatPanelProps) {
  // Chat sessions state
  const { data: sessions = [], isLoading: sessionsLoading, isError } = useChatSessions(mapId)
  const createSession = useCreateChatSession(mapId)
  const renameSession = useRenameChatSession(mapId)
  const deleteSession = useDeleteChatSession(mapId)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

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
  }, [sessions, activeSessionId, sessionsLoading, isError, createSession.isPending, autoCreateAttempted])

  // Handle session deletion
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
      { contextType: 'map' },
      {
        onSuccess: session => {
          setActiveSessionId(session.id)
        }
      }
    )
  }, [createSession])

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
        { contextType: 'map' },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }, 100)
  }, [sessions, deleteSession, createSession])

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

      // Cmd/Ctrl + K — open chat selector
      if (isMod && e.key === 'k') {
        e.preventDefault()
        setSelectorOpen(true)
        return
      }

      // Cmd/Ctrl + W — close current tab
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
    <div className='flex min-h-0 flex-1 flex-col'>
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
        selectorOpen={selectorOpen}
        onSelectorOpenChange={setSelectorOpen}
      />
      <div className='min-h-0 flex-1'>
        <MapChatPanel mapId={mapId} sessionId={activeSessionId} />
      </div>
    </div>
  )
})
