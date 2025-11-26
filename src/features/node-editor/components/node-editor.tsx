import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'
import { createEditorConfig } from '../lib/editor-config'
import type { NodeEditorProps } from '../model/editor.types'
import { AutoSavePlugin } from './auto-save-plugin'
import { EditorToolbar } from './editor-toolbar'
import { MarkdownShortcutsPlugin } from './markdown-shortcuts-plugin'

function Placeholder({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 text-sm text-muted-foreground">
      {text}
    </div>
  )
}

export function NodeEditor({
  mapId,
  nodeId,
  initialContent,
  onSave,
  autoSaveDelay = 2000,
  className
}: NodeEditorProps) {
  const { t } = useTranslation()
  const editorConfig = createEditorConfig('NodeEditor', true)

  const handleSave = (content: string) => {
    if (onSave) {
      onSave(content)
    }
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div
        className={cn(
          'relative flex flex-col rounded-lg border border-input bg-background',
          className
        )}
      >
        <EditorToolbar />
        <div className="relative min-h-[400px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] resize-none p-4 text-sm outline-none" />
            }
            placeholder={<Placeholder text={t('form.placeholders.startTyping')} />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutsPlugin />
        {onSave && <AutoSavePlugin onSave={handleSave} delay={autoSaveDelay} />}
      </div>
    </LexicalComposer>
  )
}
