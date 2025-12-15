/**
 * CodeMirror Extensions Configuration
 *
 * Configures all extensions for the Obsidian-style Live Preview editor.
 */

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput
} from '@codemirror/language'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
  rectangularSelection
} from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'

import { theme } from './theme'
import { livePreview } from './live-preview'

/**
 * Create all editor extensions
 */
export const createExtensions = (options: {
  placeholder?: string
  editable?: boolean
  onChange?: (content: string) => void
}): Extension[] => {
  const extensions: Extension[] = [
    // Core editing
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSelectionMatches(),

    // Markdown language support with code block highlighting
    markdown({
      base: markdownLanguage,
      codeLanguages: languages
    }),

    // Theming
    ...theme,

    // Live Preview decorations (Obsidian-style)
    livePreview(),

    // Keymaps
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab
    ]),

    // Line numbers and fold gutter
    lineNumbers(),
    foldGutter(),

    // Autocompletion
    autocompletion(),

    // Tab size
    EditorState.tabSize.of(2)
  ]

  // Placeholder
  if (options.placeholder) {
    extensions.push(placeholderExtension(options.placeholder))
  }

  // Editable state
  if (options.editable === false) {
    extensions.push(EditorView.editable.of(false))
    extensions.push(EditorState.readOnly.of(true))
  }

  // Change listener
  if (options.onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString()
          options.onChange!(content)
        }
      })
    )
  }

  return extensions
}

/**
 * Minimal extensions for read-only preview
 */
export const createPreviewExtensions = (): Extension[] => [
  markdown({
    base: markdownLanguage,
    codeLanguages: languages
  }),
  ...theme,
  livePreview(),
  EditorView.editable.of(false),
  EditorState.readOnly.of(true),
  highlightActiveLine(),
  drawSelection()
]
