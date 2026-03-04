/**
 * Live Preview Extension
 *
 * Simple markdown styling without breaking cursor positioning.
 * No hidden syntax - just visual styling that CodeMirror can handle.
 */

import { syntaxTree } from '@codemirror/language'
import type { Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType
} from '@codemirror/view'

// ============================================================================
// WIDGETS
// ============================================================================

/**
 * Checkbox widget for task lists
 */
class CheckboxWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly pos: number
  ) {
    super()
  }

  toDOM(view: EditorView) {
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = this.checked
    cb.className = 'cm-task-checkbox'

    cb.addEventListener('mousedown', e => {
      e.preventDefault()
      const { state } = view
      const line = state.doc.lineAt(this.pos)
      const newText = this.checked
        ? line.text.replace(/\[x\]/i, '[ ]')
        : line.text.replace(/\[ \]/, '[x]')

      if (newText !== line.text) {
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: newText }
        })
      }
    })

    return cb
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked && other.pos === this.pos
  }

  ignoreEvent() {
    return false
  }
}

// ============================================================================
// DECORATIONS
// ============================================================================

const marks = {
  h1: Decoration.mark({ class: 'cm-heading cm-heading-1' }),
  h2: Decoration.mark({ class: 'cm-heading cm-heading-2' }),
  h3: Decoration.mark({ class: 'cm-heading cm-heading-3' }),
  h4: Decoration.mark({ class: 'cm-heading cm-heading-4' }),
  h5: Decoration.mark({ class: 'cm-heading cm-heading-5' }),
  h6: Decoration.mark({ class: 'cm-heading cm-heading-6' }),
  bold: Decoration.mark({ class: 'cm-strong' }),
  italic: Decoration.mark({ class: 'cm-em' }),
  strike: Decoration.mark({ class: 'cm-strikethrough' }),
  code: Decoration.mark({ class: 'cm-inline-code' }),
  link: Decoration.mark({ class: 'cm-link' }),
  quote: Decoration.mark({ class: 'cm-blockquote' }),
  syntax: Decoration.mark({ class: 'cm-syntax' })
}

// ============================================================================
// BUILD DECORATIONS
// ============================================================================

function buildDecorations(view: EditorView): DecorationSet {
  const decorations: Range<Decoration>[] = []
  const { state } = view

  syntaxTree(state).iterate({
    enter: node => {
      const { from, to, name } = node

      switch (name) {
        // Headings
        case 'ATXHeading1':
          decorations.push(marks.h1.range(from, to))
          break
        case 'ATXHeading2':
          decorations.push(marks.h2.range(from, to))
          break
        case 'ATXHeading3':
          decorations.push(marks.h3.range(from, to))
          break
        case 'ATXHeading4':
          decorations.push(marks.h4.range(from, to))
          break
        case 'ATXHeading5':
          decorations.push(marks.h5.range(from, to))
          break
        case 'ATXHeading6':
          decorations.push(marks.h6.range(from, to))
          break

        // Text formatting
        case 'StrongEmphasis':
          decorations.push(marks.bold.range(from, to))
          break
        case 'Emphasis':
          decorations.push(marks.italic.range(from, to))
          break
        case 'Strikethrough':
          decorations.push(marks.strike.range(from, to))
          break
        case 'InlineCode':
          decorations.push(marks.code.range(from, to))
          break

        // Links
        case 'Link':
          decorations.push(marks.link.range(from, to))
          break

        // Blockquote
        case 'Blockquote':
          decorations.push(marks.quote.range(from, to))
          break

        // Syntax markers (faded)
        case 'HeaderMark':
        case 'EmphasisMark':
        case 'CodeMark':
        case 'QuoteMark':
        case 'ListMark':
          decorations.push(marks.syntax.range(from, to))
          break

        // Task checkboxes
        case 'TaskMarker': {
          const text = state.doc.sliceString(from, to)
          const checked = /x/i.test(text)
          decorations.push(
            Decoration.replace({
              widget: new CheckboxWidget(checked, from)
            }).range(from, to)
          )
          break
        }

        // Code blocks - line decoration
        case 'FencedCode': {
          const startLine = state.doc.lineAt(from)
          const endLine = state.doc.lineAt(to)
          for (let i = startLine.number; i <= endLine.number; i++) {
            const line = state.doc.line(i)
            decorations.push(Decoration.line({ class: 'cm-codeblock-line' }).range(line.from))
          }
          break
        }
      }
    }
  })

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
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  { decorations: v => v.decorations }
)

// ============================================================================
// STYLES
// ============================================================================

const livePreviewStyles = EditorView.baseTheme({
  // Headings
  '.cm-heading': {
    fontWeight: '600',
    lineHeight: '1.4'
  },
  '.cm-heading-1': { fontSize: '1.5em' },
  '.cm-heading-2': { fontSize: '1.25em' },
  '.cm-heading-3': { fontSize: '1.125em' },
  '.cm-heading-4, .cm-heading-5, .cm-heading-6': { fontSize: '1em' },

  // Text formatting
  '.cm-strong': { fontWeight: '600' },
  '.cm-em': { fontStyle: 'italic' },
  '.cm-strikethrough': { textDecoration: 'line-through' },

  // Inline code
  '.cm-inline-code': {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em',
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    padding: '0.125em 0.375em',
    borderRadius: '0.25rem'
  },

  // Links
  '.cm-link': {
    color: 'oklch(var(--brand))',
    textDecoration: 'underline',
    textUnderlineOffset: '2px'
  },

  // Blockquote
  '.cm-blockquote': {
    borderLeft: '3px solid oklch(var(--border))',
    paddingLeft: '1em',
    color: 'oklch(var(--muted-foreground))'
  },

  // Syntax markers (faded)
  '.cm-syntax': {
    opacity: '0.4'
  },

  // Task checkbox
  '.cm-task-checkbox': {
    marginRight: '0.5em',
    cursor: 'pointer',
    accentColor: 'oklch(var(--brand))'
  },

  // Code block lines
  '.cm-codeblock-line': {
    backgroundColor: 'oklch(var(--muted) / 0.4)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em'
  }
})

// ============================================================================
// EXPORT
// ============================================================================

export function livePreview() {
  return [livePreviewPlugin, livePreviewStyles]
}
