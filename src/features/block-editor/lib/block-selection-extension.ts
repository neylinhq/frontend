import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// Plugin key for accessing state
export const blockSelectionPluginKey = new PluginKey('blockSelection')

export interface BlockSelectionState {
  decorations: DecorationSet
}

/**
 * Find blocks that should be highlighted based on selection.
 *
 * Selection modes:
 * 1. Partial single block -> text-selected (inline)
 * 2. Full single block -> block-selected (node)
 * 3. Multiple list items (even partial) -> all intersecting items get block-selected
 * 4. Multiple blocks fully selected -> all get block-selected
 */
const findSelectedBlocks = (
  doc: import('@tiptap/pm/model').Node,
  from: number,
  to: number
): { blocks: Array<{ from: number; to: number }>; isPartial: boolean } => {
  const selectedBlocks: Array<{ from: number; to: number }> = []

  // Don't highlight if selection is collapsed (cursor only)
  if (from === to) {
    return { blocks: [], isPartial: false }
  }

  // Collect all list items that intersect with selection
  const intersectingListItems: Array<{
    from: number
    to: number
    fullySelected: boolean
    parentListPos: number
  }> = []

  // Collect regular blocks
  const regularBlocks: Array<{ from: number; to: number; fullySelected: boolean }> = []

  doc.nodesBetween(from, to, (node, pos, parent) => {
    // Skip the doc node itself
    if (node.type.name === 'doc') {
      return true
    }

    const nodeStart = pos
    const nodeEnd = pos + node.nodeSize
    const contentStart = nodeStart + 1 // After opening tag
    const contentEnd = nodeEnd - 1 // Before closing tag

    // Handle list items separately
    if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
      const fullySelected = from <= contentStart && to >= contentEnd
      // Check if selection intersects this list item
      const intersects = from < nodeEnd && to > nodeStart

      if (intersects) {
        // Find parent list position
        let parentListPos = -1
        if (parent) {
          // parent is the list container
          doc.nodesBetween(0, nodeStart, (n, p) => {
            if (n === parent) {
              parentListPos = p
              return false
            }
            return true
          })
        }

        intersectingListItems.push({
          from: nodeStart,
          to: nodeEnd,
          fullySelected,
          parentListPos
        })
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

      const fullySelected = from <= contentStart && to >= contentEnd
      regularBlocks.push({ from: nodeStart, to: nodeEnd, fullySelected })
      return false // Don't descend into block children
    }

    return true // Continue traversing
  })

  // Decision logic for list items:
  // If 2+ list items are intersected, select ALL of them as blocks
  // This gives a Notion-like experience where dragging across items selects them
  if (intersectingListItems.length >= 2) {
    for (const item of intersectingListItems) {
      selectedBlocks.push({ from: item.from, to: item.to })
    }
  } else if (intersectingListItems.length === 1) {
    // Single list item - only select if fully selected
    const item = intersectingListItems[0]
    if (item.fullySelected) {
      selectedBlocks.push({ from: item.from, to: item.to })
    }
  }

  // Add fully selected regular blocks
  for (const block of regularBlocks) {
    if (block.fullySelected) {
      selectedBlocks.push({ from: block.from, to: block.to })
    }
  }

  // Determine if this is a partial selection (no blocks fully selected)
  const hasFullBlocks = selectedBlocks.length > 0
  const isPartial = !hasFullBlocks

  return { blocks: selectedBlocks, isPartial }
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
            const { blocks: selectedBlocks, isPartial } = findSelectedBlocks(
              newEditorState.doc,
              from,
              to
            )

            const decorations: Decoration[] = []

            if (selectedBlocks.length > 0) {
              // Add block-level decorations for selected blocks
              for (const { from: blockFrom, to: blockTo } of selectedBlocks) {
                decorations.push(
                  Decoration.node(blockFrom, blockTo, {
                    class: 'block-selected'
                  })
                )
              }
            }

            if (isPartial) {
              // Partial selection (no full blocks) - add inline decoration
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
