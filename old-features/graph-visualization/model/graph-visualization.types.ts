export type ViewMode = 'visualization' | 'list'

export interface SelectedElements {
  nodes: string[]
  edges: string[]
}

export interface GraphControls {
  zoom: number
  isFullscreen: boolean
  showMinimap: boolean
}

export interface ToolbarState {
  autoLayoutLoading: boolean
  centeringNode: boolean
}

export interface NodeDetailsDrawerProps {
  nodeId: string | null
  onClose: () => void
}
