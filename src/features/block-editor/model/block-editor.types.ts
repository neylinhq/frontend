import type { JSONContent } from '@tiptap/react'

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
  command: () => void
  category: string
}
