import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { EditorState } from 'lexical'
import { cn } from '@/shared/lib/cn'
import type { RichTextEditorProps } from './rich-text-editor.types'

const editorTheme = {
  paragraph: 'mb-2 text-sm',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline'
  }
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className='pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground'>
      {text}
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    editable
  }

  const handleChange = (editorState: EditorState) => {
    if (!onChange) return

    editorState.read(() => {
      const json = JSON.stringify(editorState.toJSON())
      onChange(json, editorState)
    })
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={cn('relative rounded-md border border-input bg-background', className)}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className='min-h-[200px] resize-none p-3 text-sm outline-none' />
          }
          placeholder={<Placeholder text={placeholder} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  )
}
