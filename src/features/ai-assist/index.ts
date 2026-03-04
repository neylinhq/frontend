// Types

export { AIChatCore } from './components/ai-chat-core'
// AI Chat components
export { AIChatPanel } from './components/ai-chat-panel'
export { AISuggestionsPanel } from './components/ai-suggestions-panel'
export { ChatHeader } from './components/chat-header'
export { MapChatDrawer } from './components/map-chat-drawer'
export { MapChatPanel } from './components/map-chat-panel'
export { NodeChatPanel } from './components/node-chat-panel'
export { NodeChatWrapper } from './components/node-chat-wrapper'
// Proposal UI components
export { DiffBlock, DiffLine, ProposalCard } from './components/proposal-card'
export { SimilarNodesPanel } from './components/similar-nodes-panel'
// Store
export { useAIPanelStore } from './model'
// Chat session hooks
export {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession
} from './model/ai-assist.sessions.hooks'
export type {
  ChatContext,
  ChatContextType,
  ChatMessage,
  IntentHandler,
  IntentResult,
  MapChatContext,
  NodeChatContext,
  PreviewCard
} from './model/ai-assist.types'
