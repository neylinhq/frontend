import type { EditorState, LexicalEditor } from 'lexical'

export interface NodeEditorProps {
  mapId: string
  nodeId: string
  initialContent?: string
  onSave?: (content: string) => void
  autoSaveDelay?: number
  className?: string
}

export interface EditorToolbarProps {
  editor: LexicalEditor
}

export interface AutoSavePluginProps {
  onSave: (content: string) => void
  delay?: number
}
