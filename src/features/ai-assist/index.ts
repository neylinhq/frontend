export { AIChatCore } from './components/ai-chat-core'
export { AIChatPanel } from './components/ai-chat-panel'
export { AISuggestionsPanel } from './components/ai-suggestions-panel'
export { ChatHeader } from './components/chat-header'
export { ChatPanel } from './components/chat-panel'
export { ChatSelectorPopover } from './components/chat-selector-popover'
export { MapChatDrawer } from './components/map-chat-drawer'
export { NodeChatWrapper } from './components/node-chat-wrapper'
export { DiffBlock, DiffLine, ProposalCard } from './components/proposal-card'
export { SimilarNodesPanel } from './components/similar-nodes-panel'
export { useAIPanelStore, useStreamingStore } from './model'
export {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession
} from './model/ai-assist.sessions.hooks'
export type { ChatSession } from './model/ai-assist.sessions.types'
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
export { useChatKeyboardShortcuts } from './model/use-chat-keyboard-shortcuts'
export { useChatSessionManager } from './model/use-chat-session-manager'
