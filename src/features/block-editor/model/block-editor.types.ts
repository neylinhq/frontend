import type { Editor, JSONContent } from '@tiptap/react'

export interface BlockEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  onEditorUpdate?: (editor: Editor) => void // Receives editor instance for advanced use cases
  editable?: boolean
  className?: string
  placeholder?: string
}

export interface SlashMenuItem {
  title: string
  description: string
  icon: React.ReactNode
  command: () => void
  category: string
}
