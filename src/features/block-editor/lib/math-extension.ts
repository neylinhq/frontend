import { mergeAttributes, Node } from '@tiptap/core'
import katex from 'katex'

export interface MathBlockOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (options?: { latex?: string }) => ReturnType
    }
    mathInline: {
      setMathInline: (options?: { latex?: string }) => ReturnType
    }
  }
}

// Block Math (display mode) - for equations on their own line
export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const latex = node.attrs.latex || ''
    let renderedMath = ''

    try {
      renderedMath = katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        strict: false
      })
    } catch {
      renderedMath = `<span class="math-error">${latex}</span>`
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-math-block': '',
        class: 'editor-math-block',
        contenteditable: 'false'
      }),
      ['div', { class: 'math-content', innerHTML: renderedMath }]
    ]
  },

  addCommands() {
    return {
      setMathBlock:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              latex: options?.latex || 'E = mc^2'
            }
          })
        }
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.className = 'editor-math-block'
      dom.setAttribute('data-math-block', '')
      dom.setAttribute('contenteditable', 'false')

      const content = document.createElement('div')
      content.className = 'math-content'

      const renderMath = () => {
        const latex = node.attrs.latex || ''
        try {
          content.innerHTML = katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
            strict: false
          })
        } catch {
          content.innerHTML = `<span class="math-error">${latex}</span>`
        }
      }

      renderMath()
      dom.appendChild(content)

      // Double click to edit - dispatch custom event
      dom.addEventListener('dblclick', () => {
        const latex = node.attrs.latex || ''
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null) {
          const event = new CustomEvent('edit-math', {
            detail: {
              latex,
              pos,
              mode: 'block' as const
            }
          })
          document.dispatchEvent(event)
        }
      })

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false
          node = updatedNode
          renderMath()
          return true
        }
      }
    }
  }
})

// Inline Math - for formulas within text
export const MathInline = Node.create({
  name: 'mathInline',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-math-inline]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const latex = node.attrs.latex || ''
    let renderedMath = ''

    try {
      renderedMath = katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        strict: false
      })
    } catch {
      renderedMath = `<span class="math-error">${latex}</span>`
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-math-inline': '',
        class: 'editor-math-inline',
        contenteditable: 'false'
      }),
      ['span', { innerHTML: renderedMath }]
    ]
  },

  addCommands() {
    return {
      setMathInline:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              latex: options?.latex || 'x^2'
            }
          })
        }
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('span')
      dom.className = 'editor-math-inline'
      dom.setAttribute('data-math-inline', '')
      dom.setAttribute('contenteditable', 'false')

      const renderMath = () => {
        const latex = node.attrs.latex || ''
        try {
          dom.innerHTML = katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
            strict: false
          })
        } catch {
          dom.innerHTML = `<span class="math-error">${latex}</span>`
        }
      }

      renderMath()

      // Double click to edit - dispatch custom event
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const latex = node.attrs.latex || ''
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null) {
          const event = new CustomEvent('edit-math', {
            detail: {
              latex,
              pos,
              mode: 'inline' as const
            }
          })
          document.dispatchEvent(event)
        }
      })

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'mathInline') return false
          node = updatedNode
          renderMath()
          return true
        }
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        // Dispatch event to open math dialog
        const event = new CustomEvent('edit-math', {
          detail: {
            latex: '',
            pos: null,
            mode: 'inline' as const
          }
        })
        document.dispatchEvent(event)
        return true
      }
    }
  }
})
