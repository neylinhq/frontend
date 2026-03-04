/**
 * CodeMirror Extensions Configuration
 */

import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { bracketMatching, foldKeymap, indentOnInput, indentUnit } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { searchKeymap } from '@codemirror/search'
import { EditorState, type Extension } from '@codemirror/state'
import {
  dropCursor,
  EditorView,
  highlightActiveLine,
  keymap,
  placeholder as placeholderExtension
} from '@codemirror/view'
import { Table } from '@lezer/markdown'

import { livePreview } from './live-preview'
import { theme } from './theme'

export const createExtensions = (options: {
  placeholder?: string
  onChange?: (content: string) => void
}): Extension[] => {
  const extensions: Extension[] = [
    history(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    highlightActiveLine(),
    EditorView.lineWrapping,
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
      extensions: [Table]
    }),
    ...theme,
    livePreview(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab
    ]),
    autocompletion(),
    EditorView.contentAttributes.of({
      autocorrect: 'on',
      autocapitalize: 'sentences',
      spellcheck: 'true'
    }),
    EditorState.tabSize.of(2),
    indentUnit.of('  ')
  ]

  if (options.placeholder) {
    extensions.push(placeholderExtension(options.placeholder))
  }

  if (options.onChange) {
    extensions.push(
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          options.onChange?.(update.state.doc.toString())
        }
      })
    )
  }

  return extensions
}
