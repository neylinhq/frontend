import type { Exercise } from '@/entities/exercise'

// Chat message types
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  preview?: PreviewCard[]
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
  field: 'description' | 'examples' | 'sources'
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
export interface ChatContext {
  nodeId: string
  mapId: string
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
