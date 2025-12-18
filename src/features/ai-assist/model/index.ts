export type { ChatSession } from './ai-assist.chat.store'
export { getChatSessionId, useChatHistory, useChatHistoryStore } from './ai-assist.chat.store'
export type { ProposalAction } from './ai-assist.proposal.store'
export { useProposalHistory, useProposalHistoryStore } from './ai-assist.proposal.store'

export { useAIPanelStore } from './ai-assist.store'

// Chat sessions (multi-chat support)
export type {
  ChatSession as DBChatSession,
  ChatSessionMessage,
  ChatSessionWithMessages,
  ChatProposal,
  CreateSessionInput,
  RenameSessionInput,
} from './ai-assist.sessions.types'
export {
  chatSessionKeys,
  useChatSessions,
  useChatSession,
  useCreateChatSession,
  useRenameChatSession,
  useDeleteChatSession,
} from './ai-assist.sessions.hooks'
