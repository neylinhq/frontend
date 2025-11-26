import { mergeAttributes, Node } from '@tiptap/core'

export type ImageAlignment = 'left' | 'center' | 'right' | 'full'
export type ImageSize = 'small' | 'medium' | 'large' | 'full'

export interface ImageFigureOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageFigure: {
      setImageFigure: (options: {
        src: string
        alt?: string
        title?: string
        caption?: string
        alignment?: ImageAlignment
        size?: ImageSize
      }) => ReturnType
      updateImageFigure: (options: {
        caption?: string
        alignment?: ImageAlignment
        size?: ImageSize
      }) => ReturnType
    }
  }
}

export const ImageFigure = Node.create<ImageFigureOptions>({
  name: 'imageFigure',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  content: 'inline*',

  draggable: true,

  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      title: {
        default: null
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-alignment') || 'center',
        renderHTML: (attributes) => ({
          'data-alignment': attributes.alignment
        })
      },
      size: {
        default: 'large',
        parseHTML: (element) => element.getAttribute('data-size') || 'large',
        renderHTML: (attributes) => ({
          'data-size': attributes.size
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-image-figure]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { src, alt, title, alignment, size } = HTMLAttributes

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-image-figure': '',
        'data-alignment': alignment,
        'data-size': size,
        class: `editor-image-figure editor-image-figure-${alignment} editor-image-figure-${size}`
      }),
      [
        'img',
        {
          src,
          alt: alt || '',
          title: title || ''
        }
      ],
      ['figcaption', { class: 'editor-image-caption' }, 0]
    ]
  },

  addCommands() {
    return {
      setImageFigure:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || '',
              title: options.title || '',
              alignment: options.alignment || 'center',
              size: options.size || 'large'
            },
            content: options.caption ? [{ type: 'text', text: options.caption }] : []
          })
        },
      updateImageFigure:
        (options) =>
        ({ commands, state }) => {
          const { selection } = state
          const node = state.doc.nodeAt(selection.from)

          if (node?.type.name !== this.name) {
            return false
          }

          return commands.updateAttributes(this.name, options)
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const node = state.doc.nodeAt(selection.$anchor.before(selection.$anchor.depth))

        if (node?.type.name === this.name) {
          // Create new paragraph after the figure
          return editor.commands.insertContentAt(selection.$anchor.after(selection.$anchor.depth), {
            type: 'paragraph'
          })
        }

        return false
      }
    }
  }
})
