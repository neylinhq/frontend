import { mergeAttributes, Node } from '@tiptap/core'

export interface DetailsOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    details: {
      setDetails: () => ReturnType
      toggleDetails: () => ReturnType
      unsetDetails: () => ReturnType
    }
  }
}

export const Details = Node.create<DetailsOptions>({
  name: 'details',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  content: 'detailsSummary detailsContent',

  defining: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: element => element.hasAttribute('open'),
        renderHTML: attributes => {
          if (!attributes.open) {
            return {}
          }
          return { open: '' }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'editor-details'
      }),
      0
    ]
  },

  addCommands() {
    return {
      setDetails:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { open: true },
            content: [
              {
                type: 'detailsSummary',
                content: [{ type: 'text', text: 'Toggle' }]
              },
              {
                type: 'detailsContent',
                content: [{ type: 'paragraph' }]
              }
            ]
          })
        },
      toggleDetails:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
      unsetDetails:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        }
    }
  }
})

export const DetailsSummary = Node.create({
  name: 'detailsSummary',

  group: 'block',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'summary'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'summary',
      mergeAttributes(HTMLAttributes, {
        class: 'editor-details-summary'
      }),
      0
    ]
  }
})

export const DetailsContent = Node.create({
  name: 'detailsContent',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-details-content]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-details-content': '',
        class: 'editor-details-content'
      }),
      0
    ]
  }
})
