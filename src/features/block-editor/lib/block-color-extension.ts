import { Extension } from '@tiptap/core'
import { cssVarToHex } from '@/features/graph-webgl/lib/theme-bridge'

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
      // Colors are resolved at runtime via getBlockBackgroundColors()
      // These are fallback values for SSR compatibility
      colors: [
        '#e5e7eb', // gray
        '#fef3c7', // yellow
        '#dcfce7', // green
        '#dbeafe', // blue
        '#f3e8ff', // purple
        '#fce7f3', // pink
        '#fee2e2' // red
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

/** SSR fallback colors for block backgrounds */
const BLOCK_COLOR_FALLBACKS: Record<string, string> = {
  gray: '#e5e7eb',
  yellow: '#fef3c7',
  green: '#dcfce7',
  blue: '#dbeafe',
  purple: '#f3e8ff',
  pink: '#fce7f3',
  red: '#fee2e2'
}

/** Get block background colors from CSS variables - adapts to current theme */
export const getBlockBackgroundColors = () => {
  const getColor = (name: string) => {
    const color = cssVarToHex(`editor-highlight-${name}`)
    // cssVarToHex returns #808080 in SSR - use fallback
    return color === '#808080' ? BLOCK_COLOR_FALLBACKS[name] : color
  }

  return [
    { name: 'Default', color: null },
    { name: 'Gray', color: getColor('gray') },
    { name: 'Yellow', color: getColor('yellow') },
    { name: 'Green', color: getColor('green') },
    { name: 'Blue', color: getColor('blue') },
    { name: 'Purple', color: getColor('purple') },
    { name: 'Pink', color: getColor('pink') },
    { name: 'Red', color: getColor('red') }
  ]
}

