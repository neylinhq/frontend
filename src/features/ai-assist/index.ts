// Types
export type {
  ChatContext,
  ChatContextType,
  ChatMessage,
  IntentHandler,
  IntentResult,
  MapChatContext,
  NodeChatContext,
  PreviewCard
} from './ai-assist.types'
export { AIChatCore } from './components/ai-chat-core'

// AI Chat components
export { AIChatPanel } from './components/ai-chat-panel'
export { AISuggestionsPanel } from './components/ai-suggestions-panel'
export { MapChatDrawer } from './components/map-chat-drawer'
export { MapChatPanel } from './components/map-chat-panel'
export { NodeChatPanel } from './components/node-chat-panel'

// Proposal UI components
export { DiffBlock, DiffLine, ProposalCard } from './components/proposal-card'
export { SimilarNodesPanel } from './components/similar-nodes-panel'
// Store
export { useAIPanelStore } from './model'
