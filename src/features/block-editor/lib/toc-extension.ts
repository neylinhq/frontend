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
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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
        view: () => ({
          update: (view) => {
            const { doc } = view.state
            const tocNodes: { node: Node; pos: number }[] = []
            const headings: TocItem[] = []

            // Find all TOC nodes and headings
            doc.descendants((node, pos) => {
              if (node.type.name === extensionThis.name) {
                tocNodes.push({ node: node as unknown as Node, pos })
              }
              if (node.type.name === 'heading') {
                const text = node.textContent
                const id = slugify(text) || `heading-${pos}`
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

                // Add heading links
                headings.forEach((heading) => {
                  const li = document.createElement('li')
                  li.className = `editor-toc-item editor-toc-item-${heading.level}`

                  const link = document.createElement('a')
                  link.href = `#${heading.id}`
                  link.textContent = heading.text
                  link.addEventListener('click', (e) => {
                    e.preventDefault()
                    // Scroll to heading position
                    const coords = view.coordsAtPos(heading.pos)
                    window.scrollTo({
                      top: coords.top - 100,
                      behavior: 'smooth'
                    })
                  })

                  li.appendChild(link)
                  tocList.appendChild(li)
                })
              })
            }
          }
        })
      })
    ]
  }
})
