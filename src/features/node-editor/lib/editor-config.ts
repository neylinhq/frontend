import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { editorTheme } from './editor-theme'

export function createEditorConfig(
  namespace = 'NodeEditor',
  editable = true
): InitialConfigType {
  return {
    namespace,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    editable,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode
    ]
  }
}
