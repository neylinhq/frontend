import type { EditorState, LexicalEditor } from 'lexical'

export interface RichTextEditorProps {
  value?: string
  onChange?: (content: string, editorState: EditorState) => void
  placeholder?: string
  editable?: boolean
  className?: string
  onEditorChange?: (editor: LexicalEditor) => void
}
