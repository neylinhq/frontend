/**
 * CodeMirror Extensions Configuration
 *
 * Configures all extensions for the Obsidian-style Live Preview editor.
 */

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { bracketMatching, foldKeymap, indentOnInput } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { searchKeymap } from '@codemirror/search'
import { EditorState, type Extension } from '@codemirror/state'
import {
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  placeholder as placeholderExtension
} from '@codemirror/view'

import { livePreview } from './live-preview'
import { theme } from './theme'

/**
 * Create all editor extensions
 *
 * Note: Editable state is managed via Compartment in the component
 * to allow dynamic reconfiguration without recreating the editor.
 */
export const createExtensions = (options: {
  placeholder?: string
  onChange?: (content: string) => void
}): Extension[] => {
  const extensions: Extension[] = [
    // Core editing
    history(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),

    // Line wrapping - essential for prose editing
    EditorView.lineWrapping,

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

    // Autocompletion
    autocompletion(),

    // Tab size
    EditorState.tabSize.of(2)
  ]

  // Placeholder
  if (options.placeholder) {
    extensions.push(placeholderExtension(options.placeholder))
  }

  // Change listener
  if (options.onChange) {
    extensions.push(
      EditorView.updateListener.of(update => {
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
  drawSelection()
]
