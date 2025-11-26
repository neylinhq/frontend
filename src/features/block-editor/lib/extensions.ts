import { Extension } from '@tiptap/core'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
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
import { common, createLowlight } from 'lowlight'

import { Callout } from './callout-extension'
import { Column, Columns } from './columns-extension'
import { Details, DetailsContent, DetailsSummary } from './details-extension'
import { ImageFigure } from './image-figure-extension'
import { MathBlock, MathInline } from './math-extension'
import { TableOfContents } from './toc-extension'
import { VideoEmbed } from './video-embed-extension'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

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
    codeBlock: false // Disable default codeBlock, use CodeBlockLowlight instead
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
  TextAlign.configure({
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
  // Code block with syntax highlighting
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext',
    HTMLAttributes: {
      class: 'editor-code-block'
    }
  }),
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
  // Custom extension for keyboard shortcuts
  Extension.create({
    name: 'customKeymap',
    addKeyboardShortcuts() {
      return {
        'Mod-Enter': () => {
          // Could be used for submitting or other actions
          return false
        }
      }
    }
  })
]
