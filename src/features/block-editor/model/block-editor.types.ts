import type { Editor, JSONContent, Range } from '@tiptap/react'

export interface BlockEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  editable?: boolean
  className?: string
  placeholder?: string
}

export interface SlashMenuItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (props: { editor: Editor; range: Range }) => void
}
