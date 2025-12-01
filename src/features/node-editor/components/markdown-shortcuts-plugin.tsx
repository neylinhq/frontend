import { TRANSFORMERS } from '@lexical/markdown'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'

export const MarkdownShortcutsPlugin = () => {
  return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
}
