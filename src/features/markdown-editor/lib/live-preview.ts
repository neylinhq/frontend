/**
 * Obsidian-style Live Preview
 *
 * Creates a WYSIWYG-like experience while preserving markdown source.
 * Follows Design Manifesto: "Interface disappears, content shines"
 *
 * Key behaviors:
 * - Hide markdown syntax when cursor is not on the line
 * - Show raw markdown when editing (cursor on line)
 * - Smooth transitions respecting prefers-reduced-motion
 * - Full syntax highlighting for code blocks
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

// ============================================================================
// WIDGETS
// ============================================================================

/**
 * Interactive checkbox for task lists
 * Toggles between [ ] and [x] on click
 */
class CheckboxWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly pos: number
  ) {
    super()
  }

  toDOM(view: EditorView) {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = this.checked
    checkbox.className = 'cm-checkbox'
    checkbox.setAttribute('aria-label', this.checked ? 'Completed task' : 'Incomplete task')

    checkbox.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const { state } = view
      const line = state.doc.lineAt(this.pos)
      const lineText = line.text

      const newText = this.checked
        ? lineText.replace(/\[x\]/i, '[ ]')
        : lineText.replace(/\[ \]/, '[x]')

      if (newText !== lineText) {
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: newText }
        })
      }
    })

    return checkbox
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked && other.pos === this.pos
  }

  ignoreEvent() {
    return false
  }
}

/**
 * Bullet point widget - replaces -, *, + with styled bullet
 */
class BulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-bullet'
    span.textContent = '•'
    span.setAttribute('aria-hidden', 'true')
    return span
  }

  eq() {
    return true
  }
}

/**
 * Language badge for code blocks - appears in top-right corner
 */
class CodeLanguageWidget extends WidgetType {
  constructor(readonly language: string) {
    super()
  }

  toDOM() {
    const badge = document.createElement('span')
    badge.className = 'cm-code-lang'
    badge.textContent = this.language.toLowerCase()
    badge.setAttribute('aria-label', `Code language: ${this.language}`)
    return badge
  }

  eq(other: CodeLanguageWidget) {
    return other.language === this.language
  }
}

/**
 * Image widget with URL validation
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
    container.className = 'cm-image-container'

    // Validate URL
    try {
      const url = new URL(this.src, window.location.origin)
      if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }

      const img = document.createElement('img')
      img.src = url.href
      img.alt = this.alt
      img.className = 'cm-image'
      img.loading = 'lazy'

      img.onerror = () => {
        img.style.display = 'none'
        const error = document.createElement('span')
        error.className = 'cm-image-error'
        error.textContent = `[Failed to load: ${this.alt || 'image'}]`
        container.appendChild(error)
      }

      container.appendChild(img)
    } catch {
      const placeholder = document.createElement('span')
      placeholder.className = 'cm-image-error'
      placeholder.textContent = `[Invalid image: ${this.alt || 'unknown'}]`
      container.appendChild(placeholder)
    }

    return container
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt
  }
}

// ============================================================================
// DECORATIONS
// ============================================================================

const hiddenMark = Decoration.mark({ class: 'cm-hidden' })
const fadedMark = Decoration.mark({ class: 'cm-faded' })

const headingDecos: Record<number, Decoration> = {
  1: Decoration.mark({ class: 'cm-h1' }),
  2: Decoration.mark({ class: 'cm-h2' }),
  3: Decoration.mark({ class: 'cm-h3' }),
  4: Decoration.mark({ class: 'cm-h4' }),
  5: Decoration.mark({ class: 'cm-h5' }),
  6: Decoration.mark({ class: 'cm-h6' })
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if position is on active line or within selection
 */
const isActive = (view: EditorView, from: number, to: number): boolean => {
  const { state } = view
  const sel = state.selection.main

  const fromLine = state.doc.lineAt(from).number
  const toLine = state.doc.lineAt(to).number
  const cursorLine = state.doc.lineAt(sel.head).number

  const onCursorLine = cursorLine >= fromLine && cursorLine <= toLine
  const hasSelection = sel.from !== sel.to
  const overlapsSelection = hasSelection && !(sel.to < from || sel.from > to)

  return onCursorLine || overlapsSelection
}

// ============================================================================
// DECORATION BUILDER
// ============================================================================

const buildDecorations = (view: EditorView): DecorationSet => {
  const decorations: Range<Decoration>[] = []
  const { state } = view

  // Track code blocks for language badges
  const codeBlocks: { from: number; lang: string }[] = []

  syntaxTree(state).iterate({
    enter: (node) => {
      const { from, to, name } = node
      const active = isActive(view, from, to)

      switch (name) {
        // ====== HEADINGS ======
        case 'ATXHeading1':
        case 'ATXHeading2':
        case 'ATXHeading3':
        case 'ATXHeading4':
        case 'ATXHeading5':
        case 'ATXHeading6': {
          const level = parseInt(name.slice(-1))
          decorations.push(headingDecos[level].range(from, to))

          if (!active) {
            const text = state.doc.sliceString(from, to)
            const match = text.match(/^(#{1,6})\s/)
            if (match) {
              decorations.push(hiddenMark.range(from, from + match[0].length))
            }
          }
          break
        }

        // ====== EMPHASIS ======
        case 'StrongEmphasis': {
          decorations.push(Decoration.mark({ class: 'cm-bold' }).range(from, to))
          if (!active) {
            decorations.push(hiddenMark.range(from, from + 2))
            decorations.push(hiddenMark.range(to - 2, to))
          }
          break
        }

        case 'Emphasis': {
          decorations.push(Decoration.mark({ class: 'cm-italic' }).range(from, to))
          if (!active) {
            decorations.push(hiddenMark.range(from, from + 1))
            decorations.push(hiddenMark.range(to - 1, to))
          }
          break
        }

        case 'Strikethrough': {
          decorations.push(Decoration.mark({ class: 'cm-strike' }).range(from, to))
          if (!active) {
            decorations.push(hiddenMark.range(from, from + 2))
            decorations.push(hiddenMark.range(to - 2, to))
          }
          break
        }

        // Emphasis marks (**, *, __, _) - hide them when not active
        case 'EmphasisMark': {
          if (!active) {
            decorations.push(hiddenMark.range(from, to))
          } else {
            decorations.push(fadedMark.range(from, to))
          }
          break
        }

        // ====== INLINE CODE ======
        case 'InlineCode': {
          decorations.push(Decoration.mark({ class: 'cm-code' }).range(from, to))
          if (!active) {
            decorations.push(hiddenMark.range(from, from + 1))
            decorations.push(hiddenMark.range(to - 1, to))
          }
          break
        }

        // ====== LINKS ======
        case 'Link': {
          decorations.push(Decoration.mark({ class: 'cm-link' }).range(from, to))
          if (!active) {
            const text = state.doc.sliceString(from, to)
            const match = text.match(/^\[([^\]]*)\]\(([^)]*)\)$/)
            if (match) {
              decorations.push(hiddenMark.range(from, from + 1)) // [
              const textEnd = from + 1 + match[1].length
              decorations.push(hiddenMark.range(textEnd, to)) // ](url)
            }
          }
          break
        }

        // ====== IMAGES ======
        case 'Image': {
          const text = state.doc.sliceString(from, to)
          const match = text.match(/^!\[([^\]]*)\]\(([^)]*)\)$/)
          if (match && !active) {
            decorations.push(
              Decoration.replace({
                widget: new ImageWidget(match[2], match[1])
              }).range(from, to)
            )
          }
          break
        }

        // ====== BLOCKQUOTES ======
        case 'Blockquote': {
          decorations.push(Decoration.mark({ class: 'cm-quote' }).range(from, to))
          break
        }

        case 'QuoteMark': {
          if (!active) {
            decorations.push(hiddenMark.range(from, to))
          } else {
            decorations.push(fadedMark.range(from, to))
          }
          break
        }

        // ====== TASK LISTS ======
        case 'TaskMarker': {
          const text = state.doc.sliceString(from, to)
          const isChecked = /x/i.test(text)
          if (!active) {
            decorations.push(
              Decoration.replace({
                widget: new CheckboxWidget(isChecked, from)
              }).range(from, to)
            )
          }
          break
        }

        // ====== LIST MARKERS ======
        case 'ListMark': {
          const text = state.doc.sliceString(from, to).trim()

          if (/^[-*+]$/.test(text)) {
            if (!active) {
              // Replace marker with bullet, consuming trailing space
              const nextChar = state.doc.sliceString(to, to + 1)
              const endPos = nextChar === ' ' ? to + 1 : to
              decorations.push(
                Decoration.replace({
                  widget: new BulletWidget()
                }).range(from, endPos)
              )
            } else {
              decorations.push(fadedMark.range(from, to))
            }
          } else {
            // Ordered list numbers - style them
            decorations.push(Decoration.mark({ class: 'cm-list-num' }).range(from, to))
          }
          break
        }

        // ====== CODE BLOCKS ======
        case 'FencedCode': {
          const startLine = state.doc.lineAt(from)
          const endLine = state.doc.lineAt(to)

          for (let i = startLine.number; i <= endLine.number; i++) {
            const line = state.doc.line(i)
            const isFirst = i === startLine.number
            const isLast = i === endLine.number

            let cls = 'cm-codeblock'
            if (isFirst) cls += ' cm-codeblock-first'
            if (isLast) cls += ' cm-codeblock-last'

            decorations.push(Decoration.line({ class: cls }).range(line.from))
          }
          break
        }

        case 'CodeInfo': {
          const lang = state.doc.sliceString(from, to).trim()
          if (lang) {
            // Store for later - we add widget at line level
            const line = state.doc.lineAt(from)
            codeBlocks.push({ from: line.from, lang })
          }

          // Hide the language info line content when not active
          if (!active) {
            decorations.push(hiddenMark.range(from, to))
          } else {
            decorations.push(fadedMark.range(from, to))
          }
          break
        }

        case 'CodeMark': {
          if (!active) {
            decorations.push(hiddenMark.range(from, to))
          } else {
            decorations.push(fadedMark.range(from, to))
          }
          break
        }

        // ====== TABLES ======
        case 'Table': {
          const startLine = state.doc.lineAt(from)
          const endLine = state.doc.lineAt(to)
          for (let i = startLine.number; i <= endLine.number; i++) {
            const line = state.doc.line(i)
            decorations.push(Decoration.line({ class: 'cm-table' }).range(line.from))
          }
          break
        }

        case 'TableHeader': {
          decorations.push(Decoration.mark({ class: 'cm-table-header' }).range(from, to))
          break
        }

        case 'TableDelimiter': {
          if (!active) {
            decorations.push(Decoration.mark({ class: 'cm-table-delim' }).range(from, to))
          }
          break
        }

        // ====== HORIZONTAL RULE ======
        case 'HorizontalRule': {
          if (!active) {
            decorations.push(Decoration.line({ class: 'cm-hr' }).range(from))
            // Hide the actual --- or *** text
            const text = state.doc.sliceString(from, to)
            const chars = text.match(/^[\s]*?([-*_][\s]*[-*_][\s]*[-*_]+)/)
            if (chars) {
              const start = from + text.indexOf(chars[1])
              decorations.push(hiddenMark.range(start, start + chars[1].length))
            }
          }
          break
        }
      }
    }
  })

  // Add language badge widgets for code blocks
  for (const block of codeBlocks) {
    decorations.push(
      Decoration.widget({
        widget: new CodeLanguageWidget(block.lang),
        side: 1
      }).range(block.from)
    )
  }

  decorations.sort((a, b) => a.from - b.from)
  return Decoration.set(decorations, true)
}

// ============================================================================
// PLUGIN
// ============================================================================

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

// ============================================================================
// STYLES
// Minimal - typography from .prose class on container (globals.css)
// These are only for Live Preview decorations (hidden syntax, widgets)
// ============================================================================

const livePreviewStyles = EditorView.baseTheme({
  // === HIDDEN/FADED (for syntax hiding) ===
  '.cm-hidden': {
    opacity: '0',
    fontSize: '0',
    width: '0',
    display: 'inline',
    overflow: 'hidden'
  },
  '.cm-faded': {
    opacity: '0.4'
  },

  // === HEADINGS (match .prose-sm from globals.css) ===
  '.cm-h1, .cm-h2, .cm-h3, .cm-h4': {
    fontWeight: '600',
    lineHeight: '1.35',
    marginTop: '1.25em',
    marginBottom: '0.5em'
  },
  '.cm-h1': { fontSize: '1.375em' },
  '.cm-h2': { fontSize: '1.125em' },
  '.cm-h3': { fontSize: '1em' },
  '.cm-h4, .cm-h5, .cm-h6': { fontSize: '1em' },

  // === TEXT FORMATTING ===
  '.cm-bold': { fontWeight: '600' },
  '.cm-italic': { fontStyle: 'italic' },
  '.cm-strike': { textDecoration: 'line-through' },

  // === INLINE CODE ===
  '.cm-code': {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em',
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    padding: '0.125em 0.25em',
    borderRadius: '0.25rem'
  },

  // === LINKS ===
  '.cm-link': {
    color: 'oklch(var(--brand))',
    textDecoration: 'underline',
    textUnderlineOffset: '2px'
  },

  // === BLOCKQUOTES ===
  '.cm-quote': {
    borderLeft: '3px solid oklch(var(--border))',
    paddingLeft: '1em',
    fontStyle: 'italic'
  },

  // === LISTS (widgets) ===
  '.cm-bullet': { display: 'inline' },
  '.cm-list-num': { fontVariantNumeric: 'tabular-nums' },

  // === CHECKBOXES (widget) ===
  '.cm-checkbox': {
    marginRight: '0.5em',
    cursor: 'pointer',
    verticalAlign: 'middle',
    accentColor: 'oklch(var(--brand))'
  },

  // === CODE BLOCKS ===
  '.cm-codeblock': {
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em',
    paddingLeft: '1em',
    paddingRight: '1em'
  },
  '.cm-codeblock-first': {
    borderRadius: '0.375rem 0.375rem 0 0',
    paddingTop: '0.75em',
    position: 'relative'
  },
  '.cm-codeblock-last': {
    borderRadius: '0 0 0.375rem 0.375rem',
    paddingBottom: '0.75em'
  },
  '.cm-codeblock-first.cm-codeblock-last': {
    borderRadius: '0.375rem'
  },

  // === LANGUAGE BADGE (widget) ===
  '.cm-code-lang': {
    position: 'absolute',
    top: '0.5em',
    right: '0.75em',
    fontSize: '0.75em',
    fontFamily: 'var(--font-mono)',
    color: 'oklch(var(--muted-foreground))',
    backgroundColor: 'oklch(var(--muted) / 0.6)',
    padding: '0.125em 0.5em',
    borderRadius: '0.25rem',
    textTransform: 'lowercase',
    pointerEvents: 'none'
  },

  // === IMAGES (widget) ===
  '.cm-image-container': { display: 'block', margin: '1em 0' },
  '.cm-image': { maxWidth: '100%', borderRadius: '0.375rem' },
  '.cm-image-error': {
    padding: '0.5em 1em',
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    borderRadius: '0.375rem',
    fontStyle: 'italic'
  },

  // === HORIZONTAL RULE ===
  '.cm-hr': { position: 'relative', height: '3em' },
  '.cm-hr::after': {
    content: '""',
    position: 'absolute',
    left: '0',
    right: '0',
    top: '50%',
    height: '1px',
    backgroundColor: 'oklch(var(--border))'
  },

  // === TABLES ===
  '.cm-table': { fontFamily: 'var(--font-mono)', fontSize: '0.875em' },
  '.cm-table-header': { fontWeight: '600' },
  '.cm-table-delim': { opacity: '0.3' }
})

// ============================================================================
// EXPORT
// ============================================================================

export const livePreview = () => [livePreviewPlugin, livePreviewStyles]
