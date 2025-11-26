import { mergeAttributes, Node } from '@tiptap/core'

export interface ColumnsOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (columns?: number) => ReturnType
      unsetColumns: () => ReturnType
    }
  }
}

export const Columns = Node.create<ColumnsOptions>({
  name: 'columns',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  content: 'column+',

  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute('data-columns') || '2', 10),
        renderHTML: (attributes) => ({
          'data-columns': attributes.columns
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    // Use node.attrs.columns for reliable value, fallback to 2
    const columnCount = node.attrs.columns || 2
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'columns',
        'data-columns': columnCount,
        class: `editor-columns editor-columns-${columnCount}`
      }),
      0
    ]
  },

  addCommands() {
    return {
      setColumns:
        (columns = 2) =>
        ({ commands }) => {
          const columnContent = Array(columns)
            .fill(null)
            .map(() => ({
              type: 'column',
              content: [{ type: 'paragraph' }]
            }))

          return commands.insertContent({
            type: this.name,
            attrs: { columns },
            content: columnContent
          })
        },
      unsetColumns:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        }
    }
  }
})

export const Column = Node.create({
  name: 'column',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        class: 'editor-column'
      }),
      0
    ]
  }
})
