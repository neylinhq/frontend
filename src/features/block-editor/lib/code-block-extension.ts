import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { common, createLowlight } from 'lowlight'

import { CodeBlockNodeView } from '../components/code-block-nodeview'

const lowlight = createLowlight(common)

/**
 * Extended CodeBlock with language selector UI
 * Based on CodeBlockLowlight with custom React NodeView
 */
export const CodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  }
}).configure({
  lowlight,
  defaultLanguage: 'plaintext'
})
