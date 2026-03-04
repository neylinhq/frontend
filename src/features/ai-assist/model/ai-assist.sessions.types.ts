// Chat session types for multi-chat support

export interface ChatSession {
  id: string
  mapId: string
  nodeId?: string
  title: string
  contextType: 'map' | 'node'
  createdAt: string
  updatedAt: string
}

export interface ChatSessionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  proposals: ChatProposal[]
  createdAt: string
}

// Preview types from ai-assist
export type ProposalType =
  | 'connection'
  | 'new_node'
  | 'edit'
  | 'enrichment'
  | 'exercise'
  | 'edge'
  | 'node'
  | 'graph_fragment'

export interface ChatProposal {
  type: ProposalType
  status: 'pending' | 'accepted' | 'rejected'
  data: Record<string, unknown>
  appliedId?: string
}

export interface ChatSessionWithMessages {
  session: ChatSession
  messages: ChatSessionMessage[]
}

export interface CreateSessionInput {
  contextType: 'map' | 'node'
  nodeId?: string
}

export interface RenameSessionInput {
  title: string
}

export interface AddMessageInput {
  role: 'user' | 'assistant'
  content: string
  proposals?: ChatProposal[]
}

export interface GenerateTitleInput {
  message: string
}
