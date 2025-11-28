import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Quote,
  Redo,
  Underline,
  Undo
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/shared/ui/button'

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="mx-2 h-6 w-px bg-border" />

      <Button
        type="button"
        variant={isBold ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="h-8 w-8 p-0"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isItalic ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="h-8 w-8 p-0"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isUnderline ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className="h-8 w-8 p-0"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="mx-2 h-6 w-px bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h1')}
        className="h-8 w-8 p-0"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h2')}
        className="h-8 w-8 p-0"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h3')}
        className="h-8 w-8 p-0"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={formatQuote} className="h-8 w-8 p-0">
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  )
}
