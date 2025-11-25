import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'

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
    }
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
    multicolor: false
  }),
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
