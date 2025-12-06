import { Extension } from '@tiptap/core'

export interface BlockColorOptions {
  types: string[]
  colors: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockColor: {
      setBlockColor: (color: string) => ReturnType
      unsetBlockColor: () => ReturnType
    }
  }
}

export const BlockColor = Extension.create<BlockColorOptions>({
  name: 'blockColor',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      colors: [
        '#f3f4f6', // gray-100
        '#fef3c7', // amber-100
        '#dcfce7', // green-100
        '#dbeafe', // blue-100
        '#f3e8ff', // purple-100
        '#fce7f3', // pink-100
        '#fee2e2' // red-100
      ]
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {}
              }

              return {
                style: `background-color: ${attributes.backgroundColor}; border-radius: 4px; padding: 2px 4px;`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setBlockColor:
        color =>
        ({ commands }) => {
          return this.options.types.every(type =>
            commands.updateAttributes(type, { backgroundColor: color })
          )
        },
      unsetBlockColor:
        () =>
        ({ commands }) => {
          return this.options.types.every(type =>
            commands.updateAttributes(type, { backgroundColor: null })
          )
        }
    }
  }
})

export const BLOCK_BACKGROUND_COLORS = [
  { name: 'Default', color: null },
  { name: 'Gray', color: '#f3f4f6' },
  { name: 'Yellow', color: '#fef3c7' },
  { name: 'Green', color: '#dcfce7' },
  { name: 'Blue', color: '#dbeafe' },
  { name: 'Purple', color: '#f3e8ff' },
  { name: 'Pink', color: '#fce7f3' },
  { name: 'Red', color: '#fee2e2' }
]
