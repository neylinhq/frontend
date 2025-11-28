import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { editorTheme } from './editor-theme'

export function createEditorConfig(namespace = 'NodeEditor', editable = true): InitialConfigType {
  return {
    namespace,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    editable,
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, LinkNode]
  }
}
