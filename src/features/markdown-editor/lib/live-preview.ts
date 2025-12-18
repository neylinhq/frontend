/**
 * Obsidian-style Live Preview
 *
 * Implements decorations that hide markdown syntax when the cursor is not
 * on the same line, creating a WYSIWYG-like experience while preserving
 * the underlying markdown source.
 *
 * Key behaviors:
 * - Headings: Hide # markers, show styled heading
 * - Bold/Italic: Hide ** and * markers, show styled text
 * - Links: Hide [](url) syntax, show clickable link
 * - Code: Style inline code with background
 * - Lists: Style bullets and checkboxes
 * - Blockquotes: Hide > prefix, show styled quote
 */

import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Range } from '@codemirror/state'

/**
 * Widget for rendering checkboxes in task lists
 */
class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super()
  }

  toDOM() {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = this.checked
    checkbox.className = 'cm-task-checkbox'
    checkbox.setAttribute('aria-label', this.checked ? 'Completed task' : 'Incomplete task')
    return checkbox
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked
  }
}

/**
 * Widget for rendering images inline
 */
class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly alt: string
  ) {
    super()
  }

  toDOM() {
    const container = document.createElement('span')
    container.className = 'cm-image-widget'

    const img = document.createElement('img')
    img.src = this.src
    img.alt = this.alt
    img.className = 'cm-inline-image'
    img.loading = 'lazy'

    container.appendChild(img)
    return container
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt
  }
}

/**
 * Decoration styles for different markdown elements
 */
const hiddenMark = Decoration.mark({ class: 'cm-hidden-mark' })
const headingMark = Decoration.mark({ class: 'cm-heading-mark' })
const boldMark = Decoration.mark({ class: 'cm-bold' })
const italicMark = Decoration.mark({ class: 'cm-italic' })
const strikeMark = Decoration.mark({ class: 'cm-strikethrough' })
const codeMark = Decoration.mark({ class: 'cm-inline-code' })
const linkMark = Decoration.mark({ class: 'cm-link' })
const linkUrlMark = Decoration.mark({ class: 'cm-link-url' })
const quoteMark = Decoration.mark({ class: 'cm-blockquote' })
const highlightMark = Decoration.mark({ class: 'cm-highlight' })
const listBulletMark = Decoration.mark({ class: 'cm-list-bullet' })

// Heading level decorations
const headingDecorations: Record<number, Decoration> = {
  1: Decoration.mark({ class: 'cm-heading cm-heading-1' }),
  2: Decoration.mark({ class: 'cm-heading cm-heading-2' }),
  3: Decoration.mark({ class: 'cm-heading cm-heading-3' }),
  4: Decoration.mark({ class: 'cm-heading cm-heading-4' }),
  5: Decoration.mark({ class: 'cm-heading cm-heading-5' }),
  6: Decoration.mark({ class: 'cm-heading cm-heading-6' })
}

/**
 * Check if position is on the active line (cursor line)
 */
const isOnActiveLine = (view: EditorView, from: number, to: number): boolean => {
  const { state } = view
  const selection = state.selection.main

  // Get line numbers
  const fromLine = state.doc.lineAt(from).number
  const toLine = state.doc.lineAt(to).number
  const cursorLine = state.doc.lineAt(selection.head).number

  return cursorLine >= fromLine && cursorLine <= toLine
}

/**
 * Build decorations for the current document
 */
const buildDecorations = (view: EditorView): DecorationSet => {
  const decorations: Range<Decoration>[] = []
  const { state } = view

  syntaxTree(state).iterate({
    enter: (node) => {
      const { from, to, name } = node

      // Skip if cursor is on this line (show raw markdown)
      const onActiveLine = isOnActiveLine(view, from, to)

      switch (name) {
        // Headings (ATXHeading1, ATXHeading2, etc.)
        case 'ATXHeading1':
        case 'ATXHeading2':
        case 'ATXHeading3':
        case 'ATXHeading4':
        case 'ATXHeading5':
        case 'ATXHeading6': {
          const level = parseInt(name.slice(-1))
          const headingDeco = headingDecorations[level]
          if (headingDeco) {
            decorations.push(headingDeco.range(from, to))
          }

          // Hide # marks when not on active line
          if (!onActiveLine) {
            const lineText = state.doc.sliceString(from, to)
            const hashMatch = lineText.match(/^(#{1,6})\s/)
            if (hashMatch) {
              decorations.push(hiddenMark.range(from, from + hashMatch[1].length + 1))
            }
          }
          break
        }

        // Emphasis (bold)
        case 'StrongEmphasis': {
          decorations.push(boldMark.range(from, to))

          // Hide ** or __ markers when not on active line
          if (!onActiveLine) {
            const text = state.doc.sliceString(from, to)
            const marker = text.startsWith('**') ? '**' : '__'
            decorations.push(hiddenMark.range(from, from + 2))
            decorations.push(hiddenMark.range(to - 2, to))
          }
          break
        }

        // Emphasis (italic)
        case 'Emphasis': {
          decorations.push(italicMark.range(from, to))

          // Hide * or _ markers when not on active line
          if (!onActiveLine) {
            decorations.push(hiddenMark.range(from, from + 1))
            decorations.push(hiddenMark.range(to - 1, to))
          }
          break
        }

        // Strikethrough
        case 'Strikethrough': {
          decorations.push(strikeMark.range(from, to))

          // Hide ~~ markers when not on active line
          if (!onActiveLine) {
            decorations.push(hiddenMark.range(from, from + 2))
            decorations.push(hiddenMark.range(to - 2, to))
          }
          break
        }

        // Inline code
        case 'InlineCode': {
          decorations.push(codeMark.range(from, to))

          // Hide backticks when not on active line
          if (!onActiveLine) {
            decorations.push(hiddenMark.range(from, from + 1))
            decorations.push(hiddenMark.range(to - 1, to))
          }
          break
        }

        // Links
        case 'Link': {
          decorations.push(linkMark.range(from, to))

          // Parse link structure: [text](url)
          if (!onActiveLine) {
            const text = state.doc.sliceString(from, to)
            const linkMatch = text.match(/^\[([^\]]*)\]\(([^)]*)\)$/)
            if (linkMatch) {
              // Hide [ and ]( and url and )
              decorations.push(hiddenMark.range(from, from + 1)) // [
              const textEnd = from + 1 + linkMatch[1].length
              decorations.push(hiddenMark.range(textEnd, to)) // ](url)
            }
          }
          break
        }

        // Images
        case 'Image': {
          const text = state.doc.sliceString(from, to)
          const imgMatch = text.match(/^!\[([^\]]*)\]\(([^)]*)\)$/)

          if (imgMatch && !onActiveLine) {
            const [, alt, src] = imgMatch
            // Replace entire image syntax with widget
            decorations.push(
              Decoration.replace({
                widget: new ImageWidget(src, alt)
              }).range(from, to)
            )
          }
          break
        }

        // Blockquote
        case 'Blockquote': {
          decorations.push(quoteMark.range(from, to))
          break
        }

        // Quote mark (>)
        case 'QuoteMark': {
          if (!onActiveLine) {
            decorations.push(hiddenMark.range(from, to))
          } else {
            decorations.push(headingMark.range(from, to))
          }
          break
        }

        // Task list items
        case 'TaskMarker': {
          const text = state.doc.sliceString(from, to)
          const isChecked = text.includes('x') || text.includes('X')

          if (!onActiveLine) {
            // Replace [ ] or [x] with checkbox widget
            decorations.push(
              Decoration.replace({
                widget: new CheckboxWidget(isChecked)
              }).range(from, to)
            )
          }
          break
        }

        // List markers (-, *, +, 1.)
        case 'ListMark': {
          decorations.push(listBulletMark.range(from, to))
          break
        }

        // Horizontal rule
        case 'HorizontalRule': {
          if (!onActiveLine) {
            decorations.push(
              Decoration.line({ class: 'cm-hr-line' }).range(from)
            )
          }
          break
        }
      }
    }
  })

  // Sort decorations by from position
  decorations.sort((a, b) => a.from - b.from)

  return Decoration.set(decorations, true)
}

/**
 * ViewPlugin for Live Preview decorations
 */
const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
)

/**
 * Base styles for Live Preview
 * Uses CSS variables for theme-aware colors
 */
const livePreviewStyles = EditorView.baseTheme({
  // Hidden marks (fade out instead of hide for smooth transitions)
  '.cm-hidden-mark': {
    opacity: '0',
    fontSize: '0',
    width: '0',
    display: 'inline-block',
    overflow: 'hidden',
    transition: 'opacity 0.15s, font-size 0.15s'
  },

  // When line is active, show marks faded
  '.cm-activeLine .cm-hidden-mark': {
    opacity: '0.4',
    fontSize: 'inherit',
    width: 'auto',
    color: 'oklch(var(--muted-foreground))'
  },

  // Headings
  '.cm-heading': {
    fontWeight: '600'
  },
  '.cm-heading-1': {
    fontSize: '1.75em',
    lineHeight: '1.3'
  },
  '.cm-heading-2': {
    fontSize: '1.5em',
    lineHeight: '1.35'
  },
  '.cm-heading-3': {
    fontSize: '1.25em',
    lineHeight: '1.4'
  },
  '.cm-heading-4': {
    fontSize: '1.1em'
  },
  '.cm-heading-mark': {
    color: 'oklch(var(--muted-foreground))'
  },

  // Bold & Italic
  '.cm-bold': {
    fontWeight: '600'
  },
  '.cm-italic': {
    fontStyle: 'italic'
  },
  '.cm-strikethrough': {
    textDecoration: 'line-through',
    color: 'oklch(var(--muted-foreground))'
  },

  // Inline code
  '.cm-inline-code': {
    fontFamily: 'ui-monospace, monospace',
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    padding: '1px 4px',
    borderRadius: '3px',
    fontSize: '0.9em'
  },

  // Links
  '.cm-link': {
    color: 'oklch(var(--brand))',
    textDecoration: 'underline',
    cursor: 'pointer'
  },
  '.cm-link-url': {
    color: 'oklch(var(--muted-foreground))',
    fontSize: '0.9em'
  },

  // Blockquotes
  '.cm-blockquote': {
    borderLeft: '3px solid oklch(var(--border))',
    paddingLeft: '12px',
    color: 'oklch(var(--muted-foreground))',
    fontStyle: 'italic'
  },

  // Highlights
  '.cm-highlight': {
    backgroundColor: 'oklch(var(--editor-highlight-yellow))',
    borderRadius: '2px',
    padding: '0 2px'
  },

  // List bullets
  '.cm-list-bullet': {
    color: 'oklch(var(--brand))',
    fontWeight: '600'
  },

  // Task checkboxes
  '.cm-task-checkbox': {
    marginRight: '6px',
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    verticalAlign: 'middle'
  },

  // Images
  '.cm-image-widget': {
    display: 'block',
    margin: '8px 0'
  },
  '.cm-inline-image': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px'
  },

  // Horizontal rule
  '.cm-hr-line': {
    borderBottom: '2px solid oklch(var(--border))',
    margin: '16px 0'
  }
})

/**
 * Export Live Preview extension
 */
export const livePreview = () => [livePreviewPlugin, livePreviewStyles]
