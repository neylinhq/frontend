import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CalloutNodeView } from '../components/callout-nodeview'

export type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip'

const VALID_CALLOUT_TYPES: readonly CalloutType[] = ['info', 'warning', 'success', 'error', 'tip']

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { type?: CalloutType }) => ReturnType
      toggleCallout: (attributes?: { type?: CalloutType }) => ReturnType
      unsetCallout: () => ReturnType
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-callout-type') || 'info',
        renderHTML: attributes => ({
          'data-callout-type': attributes.type
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // FIX: Validate callout type to prevent class injection
    const rawType = HTMLAttributes['data-callout-type'] as string
    const calloutType = VALID_CALLOUT_TYPES.includes(rawType as CalloutType) ? rawType : 'info'

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-callout': '',
        class: `callout callout-${calloutType}`
      }),
      0
    ]
  },

  addCommands() {
    return {
      setCallout:
        attributes =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes)
        },
      toggleCallout:
        attributes =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout()
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  }
})
