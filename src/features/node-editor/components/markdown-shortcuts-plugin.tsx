import { TRANSFORMERS } from '@lexical/markdown'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'

export function MarkdownShortcutsPlugin() {
  return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
}
