export { AISuggestionsPanel } from './components/ai-suggestions-panel'
export { SimilarNodesPanel } from './components/similar-nodes-panel'

// AI Chat components
export { AIChatPanel } from './components/ai-chat-panel'
export { NodeChatPanel } from './components/node-chat-panel'
export { MapChatPanel } from './components/map-chat-panel'
export { MapChatDrawer } from './components/map-chat-drawer'
export { AIChatCore } from './components/ai-chat-core'

// Proposal UI components
export { ProposalCard, DiffLine, DiffBlock } from './components/proposal-card'

// Store
export { useAIPanelStore } from './model'

// Types
export type {
  ChatContext,
  ChatContextType,
  NodeChatContext,
  MapChatContext,
  ChatMessage,
  PreviewCard,
  IntentHandler,
  IntentResult
} from './ai-assist.types'
