/**
 * CodeMirror Extensions Configuration
 */

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { Table } from '@lezer/markdown'
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
import { searchKeymap } from '@codemirror/search'
import {
  bracketMatching,
  foldKeymap,
  indentOnInput,
  indentUnit
} from '@codemirror/language'
import {
  EditorView,
  keymap,
  placeholder as placeholderExtension,
  highlightActiveLine,
  dropCursor
} from '@codemirror/view'
import { EditorState, type Extension } from '@codemirror/state'

import { theme } from './theme'
import { livePreview } from './live-preview'

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
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          options.onChange?.(update.state.doc.toString())
        }
      })
    )
  }

  return extensions
}
