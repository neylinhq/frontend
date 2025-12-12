import type { Exercise } from '@/entities/exercise'

// Chat message types
export type ChatRole = 'user' | 'assistant'

export interface SourceNode {
  id: string
  label: string
  type: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  preview?: PreviewCard[]
  sourceNodes?: SourceNode[]
  isStreaming?: boolean
}

// Preview card types
export type PreviewType = 'exercise' | 'enrichment' | 'edge' | 'node'

export interface PreviewCard {
  id: string
  type: PreviewType
  data: ExercisePreviewData | EnrichmentPreviewData | EdgePreviewData | NodePreviewData
  status: 'pending' | 'editing' | 'approved' | 'rejected'
}

// Preview data structures
export interface ExercisePreviewData {
  exercise: Partial<Exercise>
  index?: number
  total?: number
}

export interface EnrichmentPreviewData {
  field: 'description' | 'content' | 'examples' | 'sources'
  current: string
  proposed: string
}

export interface EdgePreviewData {
  sourceNodeId: string
  targetNodeId: string
  relationType: string
  sourceLabel?: string
  targetLabel?: string
}

export interface NodePreviewData {
  label: string
  type: string
  content?: string
}

// Context types
export type ChatContextType = 'node' | 'map'

export interface NodeChatContext {
  type: 'node'
  mapId: string
  nodeId: string
  nodeName: string
  nodeType: string
  description: string
  tags: string[]
  relatedNodes: Array<{
    id: string
    name: string
    relationship: string
  }>
}

export interface MapChatContext {
  type: 'map'
  mapId: string
  mapName: string
  nodeCount: number
}

export type ChatContext = NodeChatContext | MapChatContext

// Intent handler interface
export interface IntentResult {
  content: string
  preview?: PreviewCard[]
}

export interface IntentHandler {
  name: string
  detect: (content: string) => boolean
  execute: (ctx: ChatContext, content: string, model: string) => Promise<IntentResult>
}

// Quick action types
export type QuickActionType = 'enrich' | 'examples' | 'sources' | 'exercises'

export interface QuickAction {
  type: QuickActionType
  label: string
  prompt: string
  icon: string
}

// Preview state management
export interface PreviewState {
  messageId: string
  previews: Map<string, PreviewCard>
  selected: Set<string>
}
