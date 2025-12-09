import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Plugin key for accessing state
export const blockSelectionPluginKey = new PluginKey('blockSelection')

export interface BlockSelectionState {
  decorations: DecorationSet
}

const findFullySelectedBlocks = (
  doc: import('@tiptap/pm/model').Node,
  from: number,
  to: number
) => {
  const selectedBlocks: Array<{ from: number; to: number }> = []

  // Don't highlight if selection is collapsed (cursor only)
  if (from === to) {
    return selectedBlocks
  }

  doc.nodesBetween(from, to, (node, pos, parent) => {
    // Skip the doc node itself
    if (node.type.name === 'doc') {
      return true
    }

    const nodeStart = pos
    const nodeEnd = pos + node.nodeSize
    const contentStart = nodeStart + 1 // After opening tag
    const contentEnd = nodeEnd - 1 // Before closing tag

    // Handle list items separately (each item is a block)
    if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
      const isFullySelected = from <= contentStart && to >= contentEnd
      if (isFullySelected) {
        selectedBlocks.push({ from: nodeStart, to: nodeEnd })
      }
      return false // Don't descend
    }

    // Handle top-level blocks (direct children of doc)
    if (parent?.type.name === 'doc') {
      // Skip list containers - we handle their items individually
      if (
        node.type.name === 'bulletList' ||
        node.type.name === 'orderedList' ||
        node.type.name === 'taskList'
      ) {
        return true // Descend to find list items
      }

      const isFullySelected = from <= contentStart && to >= contentEnd
      if (isFullySelected) {
        selectedBlocks.push({ from: nodeStart, to: nodeEnd })
      }
      return false // Don't descend into block children
    }

    return true // Continue traversing
  })

  return selectedBlocks
}

export const BlockSelection = Extension.create({
  name: 'blockSelection',

  addProseMirrorPlugins() {
    return [
      new Plugin<BlockSelectionState>({
        key: blockSelectionPluginKey,

        state: {
          init(): BlockSelectionState {
            return {
              decorations: DecorationSet.empty
            }
          },

          apply(tr, prevState, _oldEditorState, newEditorState): BlockSelectionState {
            // If document changed, clear decorations (user is typing)
            if (tr.docChanged) {
              return { decorations: DecorationSet.empty }
            }

            const { from, to } = newEditorState.selection
            const oldSelection = _oldEditorState.selection

            // No selection = no decorations
            if (from === to) {
              return { decorations: DecorationSet.empty }
            }

            // If selection hasn't changed, keep existing decorations
            if (from === oldSelection.from && to === oldSelection.to) {
              return prevState
            }

            // Selection changed - recreate decorations
            const selectedBlocks = findFullySelectedBlocks(newEditorState.doc, from, to)

            const decorations: Decoration[] = []

            if (selectedBlocks.length > 0) {
              // Add block-level decorations for fully selected blocks
              for (const { from: blockFrom, to: blockTo } of selectedBlocks) {
                decorations.push(
                  Decoration.node(blockFrom, blockTo, {
                    class: 'block-selected'
                  })
                )
              }
            } else {
              // Partial selection - add inline decoration
              decorations.push(
                Decoration.inline(from, to, {
                  class: 'text-selected'
                })
              )
            }

            return {
              decorations: DecorationSet.create(newEditorState.doc, decorations)
            }
          }
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations ?? DecorationSet.empty
          },
          // Disable browser's native selection highlight
          attributes: {
            class: 'custom-selection'
          }
        }
      })
    ]
  },

  addCommands() {
    return {
      selectBlock:
        (pos: number) =>
        ({ tr, state, dispatch }) => {
          const $pos = state.doc.resolve(pos)
          if ($pos.depth < 1) {
            return false
          }

          const blockStart = $pos.before(1)
          const blockEnd = $pos.after(1)

          if (dispatch) {
            // Create a text selection that covers the entire block
            const { TextSelection } = require('@tiptap/pm/state')
            const selection = TextSelection.create(state.doc, blockStart + 1, blockEnd - 1)
            tr.setSelection(selection)
            dispatch(tr)
          }
          return true
        },

      clearBlockSelection:
        () =>
        ({ tr, state, dispatch }) => {
          if (dispatch) {
            // Collapse selection to cursor
            const { TextSelection } = require('@tiptap/pm/state')
            const selection = TextSelection.create(state.doc, state.selection.from)
            tr.setSelection(selection)
            dispatch(tr)
          }
          return true
        }
    }
  }
})

// Type augmentation for TipTap commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockSelection: {
      selectBlock: (pos: number) => ReturnType
      clearBlockSelection: () => ReturnType
    }
  }
}
