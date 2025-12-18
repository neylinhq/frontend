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
  /** @deprecated Use preview with status 'approved' | 'rejected' instead */
  resolvedPreviews?: ResolvedPreview[]
  sourceNodes?: SourceNode[]
  isStreaming?: boolean
  /** AI brand identifier for assistant messages (e.g., 'openai', 'anthropic', 'deepseek') */
  brand?: string
}

// Preview card types
export type PreviewType = 'exercise' | 'enrichment' | 'edge' | 'node' | 'new_node' | 'connection' | 'graph_fragment'

export type PreviewStatus = 'pending' | 'editing' | 'approved' | 'rejected'

export interface PreviewCard {
  id: string
  type: PreviewType
  data: ExercisePreviewData | EnrichmentPreviewData | EdgePreviewData | NodePreviewData | NewNodePreviewData | ConnectionPreviewData | GraphFragmentPreviewData
  status: PreviewStatus
  /** When the preview was resolved (approved/rejected) */
  resolvedAt?: Date
  /** Data needed to undo an approved action */
  undoData?: {
    previousState: Record<string, unknown>
    actionId: string
  }
}

/** @deprecated Use PreviewCard with status 'approved' | 'rejected' instead */
export interface ResolvedPreview {
  id: string
  type: PreviewType
  data: ExercisePreviewData | EnrichmentPreviewData | EdgePreviewData | NodePreviewData | NewNodePreviewData | ConnectionPreviewData | GraphFragmentPreviewData
  status: 'approved' | 'rejected'
  resolvedAt: Date
  undoData?: {
    previousState: Record<string, unknown>
    actionId: string
  }
}

// Preview data structures
export interface ExercisePreviewData {
  exercise: Partial<Exercise> & {
    // AI-generated exercises have answer in the data, not in DB metadata
    answer?: unknown
  }
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

export interface NewNodePreviewData {
  label: string
  nodeType: string
  description: string
  content?: string
  connectTo?: Array<{
    nodeLabel: string
    relation: string
  }>
  /** ID of already created node (set after Apply, preserved after Undo) */
  appliedNodeId?: string
  /** IDs of already created edges (set after Apply, preserved after Undo) */
  appliedEdgeIds?: string[]
}

export interface ConnectionPreviewData {
  fromLabel: string
  toLabel: string
  relation: string
  reasoning: string
  /** ID of already created edge (set after Apply, preserved after Undo) */
  appliedEdgeId?: string
}

// Graph fragment - unified proposal for multiple nodes and edges
export interface GraphFragmentNode {
  /** Temporary ID for referencing within the fragment (e.g., "new_1") */
  tempId: string
  label: string
  nodeType: string
  description: string
  content?: string
  /** Whether this node is selected for applying */
  selected?: boolean
  /** Real node ID after creation */
  appliedNodeId?: string
}

export interface GraphFragmentEdge {
  /** Temporary ID for this edge (e.g., "edge_1") */
  tempId: string
  /** Source - either existing node label or tempId of new node */
  fromRef: string
  /** Target - either existing node label or tempId of new node */
  toRef: string
  /** Whether fromRef is a tempId (new node) or existing label */
  fromIsNew: boolean
  /** Whether toRef is a tempId (new node) or existing label */
  toIsNew: boolean
  relation: string
  /** Whether this edge is selected for applying */
  selected?: boolean
  /** Real edge ID after creation */
  appliedEdgeId?: string
}

export interface GraphFragmentPreviewData {
  /** Human-readable title for this fragment */
  title: string
  /** Nodes to create */
  nodes: GraphFragmentNode[]
  /** Edges to create (between new and/or existing nodes) */
  edges: GraphFragmentEdge[]
  /** Overall reasoning for this proposal */
  reasoning?: string
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
