import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import type { EditorState } from 'lexical'
import type { AutoSavePluginProps } from '../model/editor.types'
import { useAutoSave } from '../model/use-auto-save.hooks'

export function AutoSavePlugin({ onSave, delay = 2000 }: AutoSavePluginProps) {
  const debouncedSave = useAutoSave(onSave, delay)

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const json = JSON.stringify(editorState.toJSON())
      debouncedSave(json)
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}
