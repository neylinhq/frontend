import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface TableOfContentsOptions {
  HTMLAttributes: Record<string, unknown>
}

export interface TocItem {
  level: number
  text: string
  id: string
  pos: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      insertTableOfContents: () => ReturnType
    }
  }
}

// Generate a slug from text
function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // FIX: Remove leading/trailing dashes
    .trim()
  return slug || 'heading'
}

// FIX: Generate unique heading ID using position to prevent collisions
function generateHeadingId(text: string, pos: number): string {
  return `${slugify(text)}-${pos}`
}

export const TableOfContents = Node.create<TableOfContentsOptions>({
  name: 'tableOfContents',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  atom: true,

  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-toc]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-toc': '',
        class: 'editor-toc'
      }),
      ['div', { class: 'editor-toc-title' }, 'Table of Contents'],
      ['nav', { class: 'editor-toc-nav' }, ['ul', { class: 'editor-toc-list' }]]
    ]
  },

  addCommands() {
    return {
      insertTableOfContents:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name
          })
        }
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this

    return [
      new Plugin({
        key: new PluginKey('tableOfContentsUpdate'),
        view: (view) => {
          // Use event delegation to avoid memory leaks
          const handleTocClick = (e: Event) => {
            const target = e.target as HTMLElement
            if (target.tagName !== 'A') return

            const headingId = target.getAttribute('data-heading-id')
            if (!headingId) return

            e.preventDefault()

            // Find current heading position (recalculate to handle document changes)
            const { doc } = view.state
            let targetPos: number | null = null

            doc.descendants((node, pos) => {
              if (node.type.name === 'heading') {
                const text = node.textContent
                const id = generateHeadingId(text, pos)
                if (id === headingId) {
                  targetPos = pos
                  return false // Stop iteration
                }
              }
            })

            if (targetPos !== null) {
              const coords = view.coordsAtPos(targetPos)
              window.scrollTo({
                top: coords.top - 100,
                behavior: 'smooth'
              })
            }
          }

          // Add delegated event listener
          const editorDom = view.dom
          editorDom.addEventListener('click', handleTocClick)

          return {
            update: () => {
              const { doc } = view.state
              const tocNodes: { pos: number }[] = []
              const headings: TocItem[] = []

              // Find all TOC nodes and headings
              doc.descendants((node, pos) => {
                if (node.type.name === extensionThis.name) {
                  tocNodes.push({ pos })
                }
                if (node.type.name === 'heading') {
                  const text = node.textContent
                  const id = generateHeadingId(text, pos)
                  headings.push({
                    level: node.attrs.level,
                    text,
                    id,
                    pos
                  })
                }
              })

              // Update TOC content in the DOM
              if (tocNodes.length > 0 && headings.length > 0) {
                const tocElements = view.dom.querySelectorAll('.editor-toc-list')
                tocElements.forEach((tocList) => {
                  // Clear existing content
                  tocList.innerHTML = ''

                  // Add heading links (no individual listeners - using delegation)
                  headings.forEach((heading) => {
                    const li = document.createElement('li')
                    li.className = `editor-toc-item editor-toc-item-${heading.level}`

                    const link = document.createElement('a')
                    link.href = `#${heading.id}`
                    link.textContent = heading.text
                    link.setAttribute('data-heading-id', heading.id)

                    li.appendChild(link)
                    tocList.appendChild(li)
                  })
                })
              }
            },
            destroy: () => {
              // Clean up delegated event listener
              editorDom.removeEventListener('click', handleTocClick)
            }
          }
        }
      })
    ]
  }
})
