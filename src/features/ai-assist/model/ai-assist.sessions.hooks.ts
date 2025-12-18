import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import type {
  ChatSession,
  ChatSessionMessage,
  ChatSessionWithMessages,
  CreateSessionInput,
  RenameSessionInput,
  AddMessageInput,
} from './ai-assist.sessions.types'

// Response types (API wraps data in { success, data })
interface ApiResponse<T> {
  success: boolean
  data: T
}

// Query keys
export const chatSessionKeys = {
  all: ['chat-sessions'] as const,
  list: (mapId: string, nodeId?: string) => [...chatSessionKeys.all, 'list', mapId, nodeId ?? 'map'] as const,
  detail: (sessionId: string) => [...chatSessionKeys.all, 'detail', sessionId] as const,
}

// API functions
const chatSessionsApi = {
  list: async (mapId: string, nodeId?: string): Promise<ChatSession[]> => {
    const query = nodeId ? `?nodeId=${nodeId}` : ''
    const response = await api.get<ApiResponse<ChatSession[]>>(`/maps/${mapId}/chat-sessions${query}`)
    return response.data
  },

  get: async (mapId: string, sessionId: string): Promise<ChatSessionWithMessages> => {
    const response = await api.get<ApiResponse<ChatSessionWithMessages>>(`/maps/${mapId}/chat-sessions/${sessionId}`)
    return response.data
  },

  create: async (mapId: string, input: CreateSessionInput): Promise<ChatSession> => {
    const response = await api.post<ApiResponse<ChatSession>>(`/maps/${mapId}/chat-sessions`, input)
    return response.data
  },

  rename: async (mapId: string, sessionId: string, input: RenameSessionInput): Promise<void> => {
    await api.patch(`/maps/${mapId}/chat-sessions/${sessionId}`, input)
  },

  delete: async (mapId: string, sessionId: string): Promise<void> => {
    await api.delete(`/maps/${mapId}/chat-sessions/${sessionId}`)
  },

  addMessage: async (mapId: string, sessionId: string, input: AddMessageInput): Promise<ChatSessionMessage> => {
    const response = await api.post<ApiResponse<ChatSessionMessage>>(`/maps/${mapId}/chat-sessions/${sessionId}/messages`, input)
    return response.data
  },

  generateTitle: async (mapId: string, sessionId: string, message: string): Promise<{ title: string }> => {
    const response = await api.post<ApiResponse<{ title: string }>>(`/maps/${mapId}/chat-sessions/${sessionId}/generate-title`, { message })
    return response.data
  },
}

// React Query hooks

export function useChatSessions(mapId: string, nodeId?: string) {
  return useQuery({
    queryKey: chatSessionKeys.list(mapId, nodeId),
    queryFn: () => chatSessionsApi.list(mapId, nodeId),
    enabled: !!mapId,
  })
}

export function useChatSession(mapId: string, sessionId: string) {
  return useQuery({
    queryKey: chatSessionKeys.detail(sessionId),
    queryFn: () => chatSessionsApi.get(mapId, sessionId),
    enabled: !!mapId && !!sessionId,
  })
}

export function useCreateChatSession(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSessionInput) => chatSessionsApi.create(mapId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapId) })
    },
  })
}

export function useRenameChatSession(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      chatSessionsApi.rename(mapId, sessionId, { title }),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapId) })
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.detail(sessionId) })
    },
  })
}

export function useDeleteChatSession(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => chatSessionsApi.delete(mapId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapId) })
    },
  })
}

export function useAddChatMessage(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, ...input }: AddMessageInput & { sessionId: string }) =>
      chatSessionsApi.addMessage(mapId, sessionId, input),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.detail(sessionId) })
      // Also invalidate list to update session's updatedAt
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapId) })
    },
  })
}

export function useGenerateChatTitle(mapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      chatSessionsApi.generateTitle(mapId, sessionId, message),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapId) })
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.detail(sessionId) })
    },
  })
}
