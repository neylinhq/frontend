import { Extension } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'

import { BlockColor } from './block-color-extension'
import { BlockSelection } from './block-selection-extension'
import { Callout } from './callout-extension'
import { CodeBlock } from './code-block-extension'
import { Column, Columns } from './columns-extension'
import { Details, DetailsContent, DetailsSummary } from './details-extension'
import { ImageFigure } from './image-figure-extension'
import { MathBlock, MathInline } from './math-extension'
import { TableOfContents } from './toc-extension'
import { VideoEmbed } from './video-embed-extension'

export const createExtensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3]
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false
    },
    codeBlock: false, // Disable default codeBlock, use CodeBlockLowlight instead
    dropcursor: false // Disable default dropCursor, use custom indicator
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return `Heading ${node.attrs.level}`
      }
      return placeholder || "Type '/' for commands..."
    },
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty'
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: 'task-list'
    }
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'task-item'
    }
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'editor-link'
    }
  }),
  Typography,
  Underline,
  TextAlign.extend({
    // Disable default keyboard shortcuts (Ctrl+Shift+L/R/E/J conflict with browser/system shortcuts)
    addKeyboardShortcuts() {
      return {}
    }
  }).configure({
    types: ['heading', 'paragraph']
  }),
  Highlight.configure({
    multicolor: true
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'editor-image'
    }
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: 'editor-table'
    }
  }),
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  Color,
  Subscript,
  Superscript,
  // Code block with syntax highlighting and language selector
  CodeBlock,
  // Callout blocks (info, warning, success, error, tip)
  Callout,
  // Collapsible/Toggle blocks
  Details,
  DetailsSummary,
  DetailsContent,
  // Multi-column layout
  Columns,
  Column,
  // Video embeds (YouTube, Vimeo, Loom)
  VideoEmbed,
  // Table of Contents
  TableOfContents,
  // Enhanced images with captions
  ImageFigure,
  // Math/LaTeX formulas
  MathBlock,
  MathInline,
  // Block selection (triple-click highlight)
  BlockSelection,
  // Block background colors
  BlockColor,
  // Custom extension for keyboard shortcuts
  Extension.create({
    name: 'customKeymap',
    addKeyboardShortcuts() {
      return {
        'Mod-Enter': () => {
          // Could be used for submitting or other actions
          return false
        },
        // Duplicate block (Cmd+D / Ctrl+D)
        'Mod-d': ({ editor }) => {
          const { state } = editor
          const { selection } = state
          const { $from } = selection

          // Find the top-level block node
          const depth = $from.depth
          if (depth === 0) {
            return false
          }

          const blockStart = $from.before(1)
          const blockEnd = $from.after(1)
          const blockNode = state.doc.nodeAt(blockStart)

          if (!blockNode) {
            return false
          }

          // Insert duplicate after the current block
          editor.chain().focus().insertContentAt(blockEnd, blockNode.toJSON()).run()

          return true
        },
        // Move block up (Alt+ArrowUp)
        'Alt-ArrowUp': ({ editor }) => {
          const { state } = editor
          const { selection } = state
          const { $from } = selection

          if ($from.depth === 0) {
            return false
          }

          const blockStart = $from.before(1)
          if (blockStart === 0) {
            return false // Already at top
          }

          const blockNode = state.doc.nodeAt(blockStart)
          if (!blockNode) {
            return false
          }

          const blockEnd = $from.after(1)

          // Find previous block
          const $prevPos = state.doc.resolve(blockStart - 1)
          if ($prevPos.depth === 0) {
            return false
          }

          const prevBlockStart = $prevPos.before(1)

          // Delete current block and insert before previous
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.delete(blockStart, blockEnd)
              const mappedPos = tr.mapping.map(prevBlockStart)
              tr.insert(mappedPos, blockNode)
              return true
            })
            .run()

          return true
        },
        // Move block down (Alt+ArrowDown)
        'Alt-ArrowDown': ({ editor }) => {
          const { state } = editor
          const { selection } = state
          const { $from } = selection

          if ($from.depth === 0) {
            return false
          }

          const blockStart = $from.before(1)
          const blockEnd = $from.after(1)
          const blockNode = state.doc.nodeAt(blockStart)

          if (!blockNode) {
            return false
          }

          // Check if there's a next block
          if (blockEnd >= state.doc.content.size) {
            return false
          }

          const $nextPos = state.doc.resolve(blockEnd + 1)
          if ($nextPos.depth === 0) {
            return false
          }

          const nextBlockEnd = $nextPos.after(1)

          // Delete current block and insert after next
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.delete(blockStart, blockEnd)
              const mappedPos = tr.mapping.map(nextBlockEnd)
              tr.insert(mappedPos, blockNode)
              return true
            })
            .run()

          return true
        }
      }
    }
  })
]
