import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'

export function MarkdownShortcutsPlugin() {
  return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
}
