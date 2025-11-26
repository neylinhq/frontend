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
        parseHTML: element => {
          const raw = element.getAttribute('data-columns') || '2'
          const parsed = parseInt(raw, 10)

          // FIX: Validate parsed value is a valid number in expected range (2-4)
          if (Number.isNaN(parsed) || parsed < 2 || parsed > 4) {
            console.warn(`[Columns] Invalid columns value: ${raw}, defaulting to 2`)
            return 2
          }

          return parsed
        },
        renderHTML: attributes => ({
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
          // FIX: Validate columns count to prevent performance issues and UI breaking
          const validColumns = Math.max(2, Math.min(columns || 2, 4))

          const columnContent = Array(validColumns)
            .fill(null)
            .map(() => ({
              type: 'column',
              content: [{ type: 'paragraph' }]
            }))

          return commands.insertContent({
            type: this.name,
            attrs: { columns: validColumns },
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
