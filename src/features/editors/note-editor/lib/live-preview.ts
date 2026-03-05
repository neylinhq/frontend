/**
 * Live Preview Extension
 *
 * Obsidian-style markdown rendering with hidden syntax outside active selections.
 */

import { syntaxTree } from '@codemirror/language'
import type { EditorState, Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType
} from '@codemirror/view'

class HorizontalRuleWidget extends WidgetType {
  toDOM() {
    const hr = document.createElement('hr')
    hr.className = 'cm-hr'
    return hr
  }

  eq() {
    return true
  }

  ignoreEvent() {
    return false
  }
}

class TableWidget extends WidgetType {
  constructor(readonly content: string) {
    super()
  }

  toDOM() {
    const lines = this.content.split('\n').filter(l => l.trim())
    const table = document.createElement('table')
    table.className = 'cm-table'

    for (let i = 0; i < lines.length; i++) {
      // Skip delimiter row (|---|---|)
      if (i === 1 && /^\|?[\s\-:|]+\|?$/.test(lines[i])) continue

      const row = table.insertRow()
      if (i === 0) row.className = 'cm-table-header-row'

      // Split by | and drop empty first/last from leading/trailing pipes
      const raw = lines[i].split('|')
      const cells =
        raw[0].trim() === ''
          ? raw.slice(1, raw[raw.length - 1].trim() === '' ? -1 : undefined)
          : raw

      for (const cellText of cells) {
        const cell = document.createElement(i === 0 ? 'th' : 'td')
        cell.textContent = cellText.trim()
        row.appendChild(cell)
      }
    }

    return table
  }

  eq(other: TableWidget) {
    return other.content === this.content
  }

  ignoreEvent() {
    return false
  }
}

class TaskCheckboxWidget extends WidgetType {
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
    checkbox.className = 'cm-task-checkbox'
    checkbox.setAttribute('aria-label', 'Toggle task')

    checkbox.addEventListener('mousedown', event => {
      event.preventDefault()
      const { state } = view
      const line = state.doc.lineAt(this.pos)
      const nextText = this.checked
        ? line.text.replace(/\[x\]/i, '[ ]')
        : line.text.replace(/\[ \]/, '[x]')

      if (nextText !== line.text) {
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: nextText }
        })
      }
    })

    return checkbox
  }

  eq(other: TaskCheckboxWidget) {
    return other.checked === this.checked && other.pos === this.pos
  }

  ignoreEvent() {
    return false
  }
}

class ListBulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-list-bullet'
    span.setAttribute('aria-hidden', 'true')
    span.textContent = '\u2022'
    return span
  }

  eq(other: ListBulletWidget) {
    return other instanceof ListBulletWidget
  }

  ignoreEvent() {
    return false
  }
}

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
  quote: Decoration.mark({ class: 'cm-blockquote' })
}

const selectionIntersects = (state: EditorState, from: number, to: number) =>
  state.selection.ranges.some(range => range.from < to && range.to > from)

const isInCode = (state: EditorState, pos: number) => {
  let node = syntaxTree(state).resolve(pos, 1)
  while (node) {
    if (node.name === 'InlineCode' || node.name === 'CodeText' || node.name === 'FencedCode') {
      return true
    }
    node = node.parent
  }
  return false
}

const isWithinLink = (state: EditorState, pos: number) => {
  let node = syntaxTree(state).resolve(pos, 1)
  while (node) {
    if (node.name === 'Link') {
      return true
    }
    node = node.parent
  }
  return false
}

const addHiddenSyntax = (
  decorations: Range<Decoration>[],
  from: number,
  to: number,
  shouldReveal: boolean
) => {
  if (shouldReveal) {
    return
  }
  decorations.push(Decoration.mark({ class: 'cm-syntax-hidden' }).range(from, to))
}

const decorateWikiLinks = (
  state: EditorState,
  line: { from: number; text: string },
  decorations: Range<Decoration>[]
) => {
  const wikiRegex = /\[\[([^\]\n]+)\]\]/g
  let match: RegExpExecArray | null = null

  while ((match = wikiRegex.exec(line.text)) !== null) {
    const start = line.from + match.index
    const end = start + match[0].length
    const contentStart = start + 2
    const contentEnd = end - 2

    if (isInCode(state, contentStart)) {
      continue
    }

    const isActive = selectionIntersects(state, start, end)
    decorations.push(Decoration.mark({ class: 'cm-wikilink' }).range(contentStart, contentEnd))
    addHiddenSyntax(decorations, start, start + 2, isActive)
    addHiddenSyntax(decorations, end - 2, end, isActive)
  }
}

const decorateHighlights = (
  state: EditorState,
  line: { from: number; text: string },
  decorations: Range<Decoration>[]
) => {
  const highlightRegex = /==([^=\n]+)==/g
  let match: RegExpExecArray | null = null

  while ((match = highlightRegex.exec(line.text)) !== null) {
    const start = line.from + match.index
    const end = start + match[0].length
    const contentStart = start + 2
    const contentEnd = end - 2

    if (isInCode(state, contentStart)) {
      continue
    }

    const isActive = selectionIntersects(state, start, end)
    decorations.push(Decoration.mark({ class: 'cm-highlight' }).range(contentStart, contentEnd))
    addHiddenSyntax(decorations, start, start + 2, isActive)
    addHiddenSyntax(decorations, end - 2, end, isActive)
  }
}

const decorateTags = (
  state: EditorState,
  line: { from: number; text: string },
  decorations: Range<Decoration>[]
) => {
  const tagRegex = /(^|\s)#([A-Za-z0-9][A-Za-z0-9/_-]*)/g
  let match: RegExpExecArray | null = null

  while ((match = tagRegex.exec(line.text)) !== null) {
    const offset = match[1] ? match[1].length : 0
    const start = line.from + match.index + offset
    const end = start + 1 + match[2].length

    if (isInCode(state, start)) {
      continue
    }

    decorations.push(Decoration.mark({ class: 'cm-tag' }).range(start, end))
  }
}

const buildDecorations = (view: EditorView): DecorationSet => {
  const { state } = view
  const decorations: Range<Decoration>[] = []
  const contextCounts = {
    emphasis: 0,
    strong: 0,
    strike: 0,
    link: 0,
    inlineCode: 0,
    fencedCode: 0,
    blockquote: 0,
    heading: 0
  }
  const contextStack: Record<keyof typeof contextCounts, boolean[]> = {
    emphasis: [],
    strong: [],
    strike: [],
    link: [],
    inlineCode: [],
    fencedCode: [],
    blockquote: [],
    heading: []
  }

  const pushContext = (type: keyof typeof contextCounts, active: boolean) => {
    contextStack[type].push(active)
    if (active) {
      contextCounts[type] += 1
    }
  }

  const popContext = (type: keyof typeof contextCounts) => {
    const active = contextStack[type].pop()
    if (active) {
      contextCounts[type] -= 1
    }
  }

  const ranges = view.visibleRanges.length
    ? view.visibleRanges
    : [{ from: 0, to: state.doc.length }]
  const scanFrom = ranges[0].from
  const scanTo = ranges[ranges.length - 1].to

  syntaxTree(state).iterate({
    from: scanFrom,
    to: scanTo,
    enter: node => {
      const { from, to, name } = node
      const isNodeActive = selectionIntersects(state, from, to)

      switch (name) {
        case 'Emphasis':
          pushContext('emphasis', isNodeActive)
          break
        case 'StrongEmphasis':
          pushContext('strong', isNodeActive)
          break
        case 'Strikethrough':
          pushContext('strike', isNodeActive)
          break
        case 'Link':
          pushContext('link', isNodeActive)
          break
        case 'InlineCode':
          pushContext('inlineCode', isNodeActive)
          break
        case 'FencedCode':
          pushContext('fencedCode', isNodeActive)
          break
        case 'Blockquote':
          pushContext('blockquote', isNodeActive)
          break
        case 'ATXHeading1':
        case 'ATXHeading2':
        case 'ATXHeading3':
        case 'ATXHeading4':
        case 'ATXHeading5':
        case 'ATXHeading6':
          pushContext('heading', isNodeActive)
          break
      }

      switch (name) {
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
        case 'Link':
          decorations.push(marks.link.range(from, to))
          break
        case 'Blockquote':
          decorations.push(marks.quote.range(from, to))
          break
        case 'HeaderMark': {
          // Hide the space after ### too, to prevent indent
          const afterMark = to < state.doc.length ? state.doc.sliceString(to, to + 1) : ''
          const hideEnd = afterMark === ' ' ? to + 1 : to
          addHiddenSyntax(decorations, from, hideEnd, contextCounts.heading > 0)
          break
        }
        case 'HorizontalRule': {
          const isActive = selectionIntersects(state, from, to)
          if (!isActive) {
            decorations.push(
              Decoration.replace({ widget: new HorizontalRuleWidget() }).range(from, to)
            )
          }
          break
        }
        case 'Table': {
          const isActive = selectionIntersects(state, from, to)
          if (!isActive) {
            const content = state.doc.sliceString(from, to)
            decorations.push(
              Decoration.replace({ widget: new TableWidget(content), block: true }).range(from, to)
            )
          }
          break
        }
        case 'EmphasisMark':
          addHiddenSyntax(
            decorations,
            from,
            to,
            contextCounts.emphasis > 0 || contextCounts.strong > 0
          )
          break
        case 'StrikethroughMark':
          addHiddenSyntax(decorations, from, to, contextCounts.strike > 0)
          break
        case 'CodeMark':
          addHiddenSyntax(
            decorations,
            from,
            to,
            contextCounts.inlineCode > 0 || contextCounts.fencedCode > 0
          )
          break
        case 'QuoteMark':
          addHiddenSyntax(decorations, from, to, contextCounts.blockquote > 0)
          break
        case 'LinkMark':
          addHiddenSyntax(decorations, from, to, contextCounts.link > 0)
          break
        case 'CodeInfo': {
          addHiddenSyntax(decorations, from, to, contextCounts.fencedCode > 0)
          const language = state.doc.sliceString(from, to).trim()
          if (language) {
            const line = state.doc.lineAt(from)
            decorations.push(
              Decoration.line({
                attributes: { 'data-language': language }
              }).range(line.from)
            )
          }
          break
        }
        case 'URL':
          if (isWithinLink(state, from)) {
            addHiddenSyntax(decorations, from, to, contextCounts.link > 0)
          }
          break
        case 'ListMark': {
          const markerText = state.doc.sliceString(from, to)
          const isOrdered = /^\d+\.$/.test(markerText)
          const markerSelected = selectionIntersects(state, from, to)
          if (!isOrdered && !markerSelected) {
            const lineText = state.doc.lineAt(from).text
            const isTask = /^\s*[-*+]\s+\[[ xX]\]/.test(lineText)
            if (isTask) {
              addHiddenSyntax(decorations, from, to, false)
            } else {
              decorations.push(
                Decoration.replace({
                  widget: new ListBulletWidget()
                }).range(from, to)
              )
            }
          }
          break
        }
        case 'TaskMarker': {
          const text = state.doc.sliceString(from, to)
          const checked = /x/i.test(text)
          decorations.push(
            Decoration.replace({
              widget: new TaskCheckboxWidget(checked, from)
            }).range(from, to)
          )
          break
        }
        case 'FencedCode': {
          const startLine = state.doc.lineAt(from)
          const endLine = state.doc.lineAt(to)
          for (let line = startLine.number; line <= endLine.number; line++) {
            const docLine = state.doc.line(line)
            const positionClass =
              line === startLine.number
                ? 'cm-codeblock-line cm-codeblock-start'
                : line === endLine.number
                  ? 'cm-codeblock-line cm-codeblock-end'
                  : 'cm-codeblock-line'
            decorations.push(Decoration.line({ class: positionClass }).range(docLine.from))
          }
          break
        }
      }
    },
    leave: node => {
      switch (node.name) {
        case 'Emphasis':
          popContext('emphasis')
          break
        case 'StrongEmphasis':
          popContext('strong')
          break
        case 'Strikethrough':
          popContext('strike')
          break
        case 'Link':
          popContext('link')
          break
        case 'InlineCode':
          popContext('inlineCode')
          break
        case 'FencedCode':
          popContext('fencedCode')
          break
        case 'Blockquote':
          popContext('blockquote')
          break
        case 'ATXHeading1':
        case 'ATXHeading2':
        case 'ATXHeading3':
        case 'ATXHeading4':
        case 'ATXHeading5':
        case 'ATXHeading6':
          popContext('heading')
          break
      }
    }
  })

  const startLine = state.doc.lineAt(scanFrom).number
  const endLine = state.doc.lineAt(scanTo).number
  for (let line = startLine; line <= endLine; line++) {
    const docLine = state.doc.line(line)
    decorateWikiLinks(state, docLine, decorations)
    decorateHighlights(state, docLine, decorations)
    decorateTags(state, docLine, decorations)
  }

  return Decoration.set(decorations, true)
}

const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  { decorations: view => view.decorations }
)

const livePreviewStyles = EditorView.baseTheme({
  '.cm-heading': {
    fontWeight: '600',
    lineHeight: '1.4'
  },
  '.cm-heading-1': { fontSize: '1.5em' },
  '.cm-heading-2': { fontSize: '1.25em' },
  '.cm-heading-3': { fontSize: '1.125em' },
  '.cm-heading-4, .cm-heading-5, .cm-heading-6': { fontSize: '1em' },
  '.cm-strong': { fontWeight: '600' },
  '.cm-em': { fontStyle: 'italic' },
  '.cm-strikethrough': { textDecoration: 'line-through' },
  '.cm-inline-code': {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em',
    backgroundColor: 'oklch(var(--muted) / 0.5)',
    padding: '0.125em 0.375em',
    borderRadius: '0.25rem'
  },
  '.cm-link, .cm-wikilink': {
    color: 'oklch(var(--brand))',
    textDecoration: 'underline',
    textUnderlineOffset: '2px'
  },
  '.cm-blockquote': {
    borderLeft: '3px solid oklch(var(--border))',
    paddingLeft: '1em',
    color: 'oklch(var(--muted-foreground))'
  },
  '.cm-highlight': {
    backgroundColor: 'oklch(var(--editor-highlight-yellow))',
    borderRadius: '0.2em',
    padding: '0.05em 0.1em'
  },
  '.cm-tag': {
    backgroundColor: 'oklch(var(--muted) / 0.6)',
    borderRadius: '999px',
    padding: '0.05em 0.45em',
    fontSize: '0.85em'
  },
  '.cm-syntax-hidden': {
    fontSize: '0',
    lineHeight: '0',
    letterSpacing: '0'
  },
  '.cm-list-bullet': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1ch',
    lineHeight: '1',
    color: 'currentColor'
  },
  '.cm-task-checkbox': {
    marginRight: '0.5em',
    cursor: 'pointer',
    accentColor: 'oklch(var(--brand))',
    width: '1em',
    height: '1em',
    verticalAlign: 'text-bottom'
  },
  '.cm-codeblock-line': {
    backgroundColor: 'oklch(var(--muted) / 0.4)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875em',
    padding: '0.35rem 0.85rem',
    borderRadius: '0'
  },
  '.cm-codeblock-start': {
    position: 'relative',
    paddingTop: '0.6rem',
    borderTopLeftRadius: '0.5rem',
    borderTopRightRadius: '0.5rem'
  },
  '.cm-codeblock-end': {
    paddingBottom: '0.6rem',
    borderBottomLeftRadius: '0.5rem',
    borderBottomRightRadius: '0.5rem'
  },
  '.cm-codeblock-start::after': {
    content: 'attr(data-language)',
    position: 'absolute',
    top: '0.3rem',
    right: '0.75rem',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'oklch(var(--muted-foreground))'
  },
  '.cm-hr': {
    border: 'none',
    borderTop: '1px solid oklch(var(--border))',
    margin: '0.25em 0'
  },
  '.cm-table': {
    borderCollapse: 'collapse',
    width: 'auto',
    margin: '0.5em 0',
    fontSize: '0.9em'
  },
  '.cm-table th, .cm-table td': {
    border: '1px solid oklch(var(--border))',
    padding: '0.4em 0.75em',
    textAlign: 'left'
  },
  '.cm-table th': {
    fontWeight: '600',
    backgroundColor: 'oklch(var(--muted) / 0.4)'
  },
  '.cm-table tr:nth-child(even) td': {
    backgroundColor: 'oklch(var(--muted) / 0.15)'
  }
})

export const livePreview = () => [livePreviewPlugin, livePreviewStyles]
