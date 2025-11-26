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

// Helper to safely render math with proper error handling (no XSS)
function renderMathSafe(latex: string, displayMode: boolean): { html: string; isError: boolean } {
  try {
    return {
      html: katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false
      }),
      isError: false
    }
  } catch {
    // Escape latex to prevent XSS
    const escaped = latex
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    return {
      html: `<span class="math-error">${escaped}</span>`,
      isError: true
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
        parseHTML: element => element.getAttribute('data-latex') || '',
        renderHTML: attributes => ({
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
    const { html } = renderMathSafe(latex, true)

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-math-block': '',
        class: 'editor-math-block',
        contenteditable: 'false'
      }),
      ['div', { class: 'math-content', innerHTML: html }]
    ]
  },

  addCommands() {
    return {
      setMathBlock:
        options =>
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
    return ({ node, getPos }) => {
      const dom = document.createElement('div')
      dom.className = 'editor-math-block'
      dom.setAttribute('data-math-block', '')
      dom.setAttribute('contenteditable', 'false')

      const content = document.createElement('div')
      content.className = 'math-content'

      const updateContent = () => {
        const latex = node.attrs.latex || ''
        const { html } = renderMathSafe(latex, true)
        content.innerHTML = html
      }

      updateContent()
      dom.appendChild(content)

      // Double click to edit - dispatch custom event
      const handleDblClick = () => {
        const latex = node.attrs.latex || ''
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null) {
          document.dispatchEvent(
            new CustomEvent('edit-math', {
              detail: { latex, pos, mode: 'block' as const }
            })
          )
        }
      }

      dom.addEventListener('dblclick', handleDblClick)

      return {
        dom,
        update: updatedNode => {
          if (updatedNode.type.name !== this.name) return false
          node = updatedNode
          updateContent()
          return true
        },
        destroy: () => {
          dom.removeEventListener('dblclick', handleDblClick)
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
        parseHTML: element => element.getAttribute('data-latex') || '',
        renderHTML: attributes => ({
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
    const { html } = renderMathSafe(latex, false)

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-math-inline': '',
        class: 'editor-math-inline',
        contenteditable: 'false'
      }),
      ['span', { innerHTML: html }]
    ]
  },

  addCommands() {
    return {
      setMathInline:
        options =>
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
    return ({ node, getPos }) => {
      const dom = document.createElement('span')
      dom.className = 'editor-math-inline'
      dom.setAttribute('data-math-inline', '')
      dom.setAttribute('contenteditable', 'false')

      const updateContent = () => {
        const latex = node.attrs.latex || ''
        const { html } = renderMathSafe(latex, false)
        dom.innerHTML = html
      }

      updateContent()

      // Double click to edit - dispatch custom event
      const handleDblClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const latex = node.attrs.latex || ''
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos !== null) {
          document.dispatchEvent(
            new CustomEvent('edit-math', {
              detail: { latex, pos, mode: 'inline' as const }
            })
          )
        }
      }

      dom.addEventListener('dblclick', handleDblClick)

      return {
        dom,
        update: updatedNode => {
          if (updatedNode.type.name !== this.name) return false
          node = updatedNode
          updateContent()
          return true
        },
        destroy: () => {
          dom.removeEventListener('dblclick', handleDblClick)
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
