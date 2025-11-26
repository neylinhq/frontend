export type DisplayMode = 'visualization' | 'list'

export interface SelectedElements {
  nodes: string[]
  edges: string[]
}

export interface GraphControls {
  isFullscreen: boolean
}

export interface ToolbarState {
  autoLayoutLoading: boolean
  centeringNode: boolean
}

export interface NodeDetailsDrawerProps {
  nodeId: string | null
  onClose: () => void
}
