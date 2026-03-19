import { create } from 'zustand'

interface ActiveStream {
  sessionId: string
  abortController: AbortController
  aiMessageId: string
}

interface StreamingState {
  streams: Record<string, ActiveStream>
}

interface StreamingActions {
  /** Create AbortController, register stream, return the controller */
  startStream: (sessionId: string, aiMessageId: string) => AbortController
  /** Abort the stream and remove it from the store */
  stopStream: (sessionId: string) => void
  /** Remove stream entry without aborting (natural completion / error) */
  clearStream: (sessionId: string) => void
  /** Abort all active streams (page-level cleanup) */
  clearAll: () => void
}

export const useStreamingStore = create<StreamingState & StreamingActions>()((set, get) => ({
  streams: {},

  startStream: (sessionId, aiMessageId) => {
    // Abort any existing stream for this session first
    const existing = get().streams[sessionId]
    if (existing) {
      existing.abortController.abort()
    }

    const abortController = new AbortController()

    set(state => ({
      streams: {
        ...state.streams,
        [sessionId]: { sessionId, abortController, aiMessageId }
      }
    }))

    return abortController
  },

  stopStream: sessionId => {
    const stream = get().streams[sessionId]
    if (stream) {
      stream.abortController.abort()
    }
    set(state => {
      const { [sessionId]: _, ...rest } = state.streams
      return { streams: rest }
    })
  },

  clearStream: sessionId => {
    set(state => {
      const { [sessionId]: _, ...rest } = state.streams
      return { streams: rest }
    })
  },

  clearAll: () => {
    const streams = get().streams
    for (const stream of Object.values(streams)) {
      stream.abortController.abort()
    }
    set({ streams: {} })
  }
}))
