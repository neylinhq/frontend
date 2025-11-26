import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Plugin key for accessing state
export const blockSelectionPluginKey = new PluginKey('blockSelection')

export interface BlockSelectionState {
  decorations: DecorationSet
}

/**
 * Finds all blocks that are fully selected by the current selection.
 * A block is "fully selected" if the selection covers all its content.
 * For lists, each list item is treated as a separate block.
 */
function findFullySelectedBlocks(
  doc: import('@tiptap/pm/model').Node,
  from: number,
  to: number
): Array<{ from: number; to: number }> {
  const selectedBlocks: Array<{ from: number; to: number }> = []

  // Don't highlight if selection is collapsed (cursor only)
  if (from === to) return selectedBlocks

  doc.nodesBetween(from, to, (node, pos, parent) => {
    // Skip the doc node itself
    if (node.type.name === 'doc') return true

    const nodeStart = pos
    const nodeEnd = pos + node.nodeSize
    const contentStart = nodeStart + 1 // After opening tag
    const contentEnd = nodeEnd - 1 // Before closing tag

    // Handle list items separately (each item is a block)
    if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
      // Check if selection fully covers this list item's content
      if (from <= contentStart && to >= contentEnd) {
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

      // Check if selection fully covers this block's content
      if (from <= contentStart && to >= contentEnd) {
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

          apply(tr, _state, _oldEditorState, newEditorState): BlockSelectionState {
            // If document changed, clear decorations (user is typing)
            if (tr.docChanged) {
              return { decorations: DecorationSet.empty }
            }

            // Check selection and create decorations for fully selected blocks
            const { from, to } = newEditorState.selection
            const selectedBlocks = findFullySelectedBlocks(newEditorState.doc, from, to)

            if (selectedBlocks.length === 0) {
              return { decorations: DecorationSet.empty }
            }

            // Create decorations for all fully selected blocks
            const decorations = selectedBlocks.map(({ from: blockFrom, to: blockTo }) =>
              Decoration.node(blockFrom, blockTo, {
                class: 'block-selected'
              })
            )

            return {
              decorations: DecorationSet.create(newEditorState.doc, decorations)
            }
          }
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations ?? DecorationSet.empty
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
          if ($pos.depth < 1) return false

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
