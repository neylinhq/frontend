import type { Editor } from '@tiptap/react'
import {
  Bold01Icon,
  CheckIcon,
  ChevronDownIcon,
  Code01Icon,
  Copy01Icon,
  DotsHorizontalIcon,
  Italic01Icon,
  Strikethrough01Icon,
  Trash01Icon,
  Type01Icon
} from '@untitledui/icons-react/outline'
import {
  CheckSquare,
  FileText,
  Link,
  List,
  ListNumbers,
  MathOperations,
  Quotes,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextUnderline
} from '@phosphor-icons/react'
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { cssVarToHex } from '@/features/graph-webgl/lib/theme-bridge'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'
import { copyAsMarkdown } from '../lib/markdown-serializer'
import { MENU } from '../model/block-editor.constants'
import styles from '../styles/bubble-menu.module.css'

// Menu state management with reducer (cleaner than 4 separate booleans)
type MenuType = 'closed' | 'link' | 'color' | 'turnInto' | 'more'

interface MenuState {
  activeMenu: MenuType
  linkUrl: string
}

type MenuAction =
  | { type: 'OPEN_MENU'; menu: MenuType }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_LINK_URL'; url: string }
  | { type: 'TOGGLE_MENU'; menu: MenuType }

const menuReducer = (state: MenuState, action: MenuAction): MenuState => {
  switch (action.type) {
    case 'OPEN_MENU':
      return { ...state, activeMenu: action.menu }
    case 'CLOSE_ALL':
      return { activeMenu: 'closed', linkUrl: '' }
    case 'SET_LINK_URL':
      return { ...state, linkUrl: action.url }
    case 'TOGGLE_MENU':
      return {
        ...state,
        activeMenu: state.activeMenu === action.menu ? 'closed' : action.menu
      }
    default:
      return state
  }
}

const initialMenuState: MenuState = {
  activeMenu: 'closed',
  linkUrl: ''
}

/**
 * Hook for keyboard navigation in dropdown menus
 * Handles ArrowUp/ArrowDown/Enter/Escape
 */
const useDropdownKeyboard = <T,>(
  items: T[],
  isOpen: boolean,
  onSelect: (item: T) => void,
  onClose: () => void,
  containerRef: RefObject<HTMLDivElement>
) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when menu opens/closes or items change
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return
    }
    const selectedEl = containerRef.current.querySelector('[data-selected="true"]')
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, containerRef])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
          e.preventDefault()
          if (items[selectedIndex]) {
            onSelect(items[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, selectedIndex, onSelect, onClose])

  return { selectedIndex, setSelectedIndex }
}

// Block types for Turn Into dropdown (labels via i18n: editor.bubble.blockTypes.{name})
const BLOCK_TYPES = [
  {
    name: 'text',
    icon: Type01Icon,
    command: (editor: Editor) => editor.chain().focus().setParagraph().run()
  },
  {
    name: 'heading1',
    icon: TextHOne,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    name: 'heading2',
    icon: TextHTwo,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    name: 'heading3',
    icon: TextHThree,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    name: 'bulletList',
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    name: 'numberedList',
    icon: ListNumbers,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    name: 'todoList',
    icon: CheckSquare,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run()
  },
  {
    name: 'quote',
    icon: Quotes,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run()
  }
]

/** Get text colors from CSS variables - adapts to current theme */
const getTextColors = () => [
  { key: 'default', color: null, label: 'Default' },
  { key: 'gray', color: cssVarToHex('editor-text-gray'), label: 'Gray' },
  { key: 'brown', color: cssVarToHex('editor-text-brown'), label: 'Brown' },
  { key: 'orange', color: cssVarToHex('editor-text-orange'), label: 'Orange' },
  { key: 'yellow', color: cssVarToHex('editor-text-yellow'), label: 'Yellow' },
  { key: 'green', color: cssVarToHex('editor-text-green'), label: 'Green' },
  { key: 'blue', color: cssVarToHex('editor-text-blue'), label: 'Blue' },
  { key: 'purple', color: cssVarToHex('editor-text-purple'), label: 'Purple' },
  { key: 'pink', color: cssVarToHex('editor-text-pink'), label: 'Pink' },
  { key: 'red', color: cssVarToHex('editor-text-red'), label: 'Red' }
]

/** Get highlight colors from CSS variables - adapts to current theme */
const getHighlightColors = () => [
  { key: 'default', color: null, label: 'Default' },
  { key: 'gray', color: cssVarToHex('editor-highlight-gray'), label: 'Gray' },
  { key: 'yellow', color: cssVarToHex('editor-highlight-yellow'), label: 'Yellow' },
  { key: 'green', color: cssVarToHex('editor-highlight-green'), label: 'Green' },
  { key: 'blue', color: cssVarToHex('editor-highlight-blue'), label: 'Blue' },
  { key: 'purple', color: cssVarToHex('editor-highlight-purple'), label: 'Purple' },
  { key: 'pink', color: cssVarToHex('editor-highlight-pink'), label: 'Pink' },
  { key: 'orange', color: cssVarToHex('editor-highlight-orange'), label: 'Orange' },
  { key: 'red', color: cssVarToHex('editor-highlight-red'), label: 'Red' }
]

interface EditorBubbleMenuProps {
  editor: Editor
  onOpenMathDialog?: (mode: 'block' | 'inline') => void
}

export const EditorBubbleMenu = ({ editor, onOpenMathDialog }: EditorBubbleMenuProps) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [menuState, dispatch] = useReducer(menuReducer, initialMenuState)
  // Counter to force re-render on every transaction (for reactive block type updates)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const turnIntoRef = useRef<HTMLDivElement>(null)
  const turnIntoTriggerRef = useRef<HTMLButtonElement>(null)
  const colorTriggerRef = useRef<HTMLButtonElement>(null)
  const moreTriggerRef = useRef<HTMLButtonElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Track dropdown positioning (top or bottom)
  const [dropdownSide, setDropdownSide] = useState<'top' | 'bottom'>('bottom')

  // Derived state for cleaner checks
  const isLinkInputOpen = menuState.activeMenu === 'link'
  const isColorPickerOpen = menuState.activeMenu === 'color'
  const isTurnIntoOpen = menuState.activeMenu === 'turnInto'
  const isMoreMenuOpen = menuState.activeMenu === 'more'

  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  // Turn Into dropdown keyboard navigation
  const handleTurnIntoSelect = useCallback(
    (blockType: (typeof BLOCK_TYPES)[number]) => {
      blockType.command(editor)
      dispatch({ type: 'CLOSE_ALL' })
    },
    [editor]
  )

  const { selectedIndex: turnIntoSelectedIndex } = useDropdownKeyboard(
    BLOCK_TYPES,
    isTurnIntoOpen,
    handleTurnIntoSelect,
    closeAll,
    turnIntoRef
  )

  // More menu items for keyboard nav
  const moreMenuItems = useMemo(
    () => [
      { id: 'copy', action: 'copy' },
      { id: 'copyMarkdown', action: 'copyMarkdown' },
      { id: 'delete', action: 'delete' }
    ],
    []
  )

  const handleMoreMenuSelect = useCallback(
    async (item: { id: string; action: string }) => {
      switch (item.action) {
        case 'copy': {
          const { from, to } = editor.state.selection
          const text = editor.state.doc.textBetween(from, to, ' ')
          await navigator.clipboard.writeText(text).catch(() => {})
          break
        }
        case 'copyMarkdown': {
          const json = editor.getJSON()
          await copyAsMarkdown(json)
          break
        }
        case 'delete':
          editor.chain().focus().deleteSelection().run()
          break
      }
      dispatch({ type: 'CLOSE_ALL' })
    },
    [editor]
  )

  const { selectedIndex: moreMenuSelectedIndex } = useDropdownKeyboard(
    moreMenuItems,
    isMoreMenuOpen,
    handleMoreMenuSelect,
    closeAll,
    moreMenuRef
  )

  useEffect(() => {
    if (isLinkInputOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLinkInputOpen])

  // Determine dropdown positioning based on viewport space
  useEffect(() => {
    const activeMenu = menuState.activeMenu
    if (activeMenu === 'closed' || activeMenu === 'link') {
      return
    }

    // Get the trigger button for the active menu
    let triggerRef: React.RefObject<HTMLButtonElement | null> | null = null
    let dropdownHeight = 280 // approximate height

    if (activeMenu === 'turnInto') {
      triggerRef = turnIntoTriggerRef
      dropdownHeight = 320 // 8 items * ~40px
    } else if (activeMenu === 'color') {
      triggerRef = colorTriggerRef
      dropdownHeight = 360 // color picker is taller
    } else if (activeMenu === 'more') {
      triggerRef = moreTriggerRef
      dropdownHeight = 120 // 3 items
    }

    if (!triggerRef?.current) {
      return
    }

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // Open upward if not enough space below AND there's more space above
    if (spaceBelow < dropdownHeight + 16 && spaceAbove > spaceBelow) {
      setDropdownSide('top')
    } else {
      setDropdownSide('bottom')
    }
  }, [menuState.activeMenu])

  // Track last known selection to detect actual changes
  const lastSelectionRef = useRef<{ from: number; to: number } | null>(null)
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track when we last had a non-empty selection (for triple-click handling)
  const lastNonEmptyTimeRef = useRef<number>(0)

  const updateMenu = useCallback(() => {
    const { selection } = editor.state
    const { from, to } = selection
    const hasSelection = from !== to

    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }

    // No selection = schedule hide (debounce to handle triple-click)
    if (!hasSelection) {
      // Check how recently we had a non-empty selection
      // Triple-click causes: selection -> empty -> new selection in rapid succession
      const timeSinceNonEmpty = Date.now() - lastNonEmptyTimeRef.current

      // If we had a selection < 200ms ago, this might be triple-click intermediate state
      // Use longer delay to let the final selection settle
      const delay = timeSinceNonEmpty < 200 ? 150 : 50

      updateTimeoutRef.current = setTimeout(() => {
        // Re-check selection after delay
        const { from: newFrom, to: newTo } = editor.state.selection
        if (newFrom === newTo && isVisible) {
          setIsVisible(false)
          dispatch({ type: 'CLOSE_ALL' })
        }
      }, delay)
      return
    }

    // Selection exists - record timestamp and update immediately
    lastNonEmptyTimeRef.current = Date.now()

    const lastSelection = lastSelectionRef.current
    const selectionChanged =
      !lastSelection || lastSelection.from !== from || lastSelection.to !== to
    lastSelectionRef.current = { from, to }

    if (!selectionChanged && isVisible) {
      return
    }

    // Get the selection coordinates (viewport-relative)
    const { view } = editor

    // Get the .tiptap-editor container (where BubbleMenu is positioned)
    const tiptapEditor = view.dom.closest('.tiptap-editor') as HTMLElement
    if (!tiptapEditor) {
      return
    }
    const containerRect = tiptapEditor.getBoundingClientRect()

    // Get selection bounding box using getBoundingClientRect on the range
    // This gives us the true visual bounds of the entire selection
    const domSelection = window.getSelection()
    let selectionRect: DOMRect | null = null

    if (domSelection && domSelection.rangeCount > 0) {
      const range = domSelection.getRangeAt(0)
      selectionRect = range.getBoundingClientRect()
    }

    // Fallback to coordsAtPos if no valid rect
    if (!selectionRect || selectionRect.width === 0) {
      const start = view.coordsAtPos(from)
      const end = view.coordsAtPos(to)
      selectionRect = new DOMRect(
        Math.min(start.left, end.left),
        Math.min(start.top, end.top),
        Math.abs(end.left - start.left),
        Math.abs(end.bottom - start.top)
      )
    }

    // Calculate position relative to .tiptap-editor container
    // Center horizontally based on selection
    let left = selectionRect.left + selectionRect.width / 2 - containerRect.left
    // Position above selection with small gap
    let top = selectionRect.top - containerRect.top - MENU.VIEWPORT_PADDING

    // Boundary checking relative to container
    const editorWidth = containerRect.width
    const halfMenuWidth = MENU.BUBBLE_MIN_WIDTH / 2

    // Check if menu would go off the left edge of editor
    if (left - halfMenuWidth < MENU.VIEWPORT_PADDING) {
      left = halfMenuWidth + MENU.VIEWPORT_PADDING
    }
    // Check if menu would go off the right edge of editor
    else if (left + halfMenuWidth > editorWidth - MENU.VIEWPORT_PADDING) {
      left = editorWidth - halfMenuWidth - MENU.VIEWPORT_PADDING
    }

    // Check if menu fits above selection relative to VIEWPORT (not container)
    // This ensures the menu doesn't go off the top of the screen
    const spaceAboveViewport = selectionRect.top // viewport-relative
    if (spaceAboveViewport < MENU.BUBBLE_HEIGHT + MENU.VIEWPORT_PADDING) {
      // Not enough space above in viewport - position below selection
      top = selectionRect.bottom - containerRect.top + MENU.VIEWPORT_PADDING + MENU.BUBBLE_HEIGHT
    }

    setPosition({ top, left })
    setIsVisible(true)
    // Force re-render to update block type in Turn Into dropdown
    forceUpdate()
  }, [editor, isVisible])

  useEffect(() => {
    editor.on('selectionUpdate', updateMenu)
    editor.on('transaction', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('transaction', updateMenu)
      // Cleanup timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [editor, updateMenu])

  // Hide bubble menu when clicking outside the editor
  useEffect(() => {
    // Ensure editor view is available
    if (!editor.view) {
      return
    }

    const editorDom = editor.view.dom

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const menuEl = menuRef.current

      // Don't hide if clicking inside editor or menu
      if (editorDom?.contains(target) || menuEl?.contains(target)) {
        return
      }

      setIsVisible(false)
      dispatch({ type: 'CLOSE_ALL' })
    }

    // Also hide on blur (when editor loses focus)
    const handleBlur = () => {
      // Small delay to allow clicking menu buttons
      setTimeout(() => {
        if (!editor.isFocused && !menuRef.current?.contains(document.activeElement)) {
          setIsVisible(false)
          dispatch({ type: 'CLOSE_ALL' })
        }
      }, 100)
    }

    document.addEventListener('mousedown', handleClickOutside)
    editorDom.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      editorDom.removeEventListener('blur', handleBlur)
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (menuState.linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const url = menuState.linkUrl.startsWith('http')
      ? menuState.linkUrl
      : `https://${menuState.linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    dispatch({ type: 'CLOSE_ALL' })
  }, [editor, menuState.linkUrl])

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setLink()
    }
    if (e.key === 'Escape') {
      dispatch({ type: 'CLOSE_ALL' })
    }
  }

  // Determine current block type (recalculated on every render via forceUpdate)
  const getCurrentBlockType = () => {
    if (editor.isActive('heading', { level: 1 })) {
      return BLOCK_TYPES[1]
    }
    if (editor.isActive('heading', { level: 2 })) {
      return BLOCK_TYPES[2]
    }
    if (editor.isActive('heading', { level: 3 })) {
      return BLOCK_TYPES[3]
    }
    if (editor.isActive('bulletList')) {
      return BLOCK_TYPES[4]
    }
    if (editor.isActive('orderedList')) {
      return BLOCK_TYPES[5]
    }
    if (editor.isActive('taskList')) {
      return BLOCK_TYPES[6]
    }
    if (editor.isActive('blockquote')) {
      return BLOCK_TYPES[7]
    }
    return BLOCK_TYPES[0]
  }
  const currentBlockType = getCurrentBlockType()
  const CurrentBlockIcon = currentBlockType?.icon || Type01Icon

  if (!isVisible) {
    return null
  }

  if (isLinkInputOpen) {
    return (
      <div
        ref={menuRef}
        className='absolute z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1'
        style={{
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <input
          ref={inputRef}
          type='text'
          value={menuState.linkUrl}
          onChange={e => dispatch({ type: 'SET_LINK_URL', url: e.target.value })}
          onKeyDown={handleLinkKeyDown}
          placeholder={t('editor.bubble.urlPlaceholder')}
          className='h-7 w-44 rounded-md border-none bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground'
        />
        <Button variant='ghost' size='sm' onClick={setLink} className='h-7 px-2 text-[11px]'>
          {t('editor.bubble.save')}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => dispatch({ type: 'CLOSE_ALL' })}
          className='h-7 px-2 text-[11px]'
        >
          {t('editor.bubble.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className={styles.container}
      style={{
        top: position.top,
        left: position.left
      }}
    >
      {/* Turn Into Dropdown */}
      <div className='relative'>
        <button
          ref={turnIntoTriggerRef}
          type='button'
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'turnInto' })}
          aria-haspopup='listbox'
          aria-expanded={isTurnIntoOpen}
          aria-label={t('editor.bubble.turnInto')}
          className={cn(styles.turnIntoTrigger, isTurnIntoOpen && styles.turnIntoTriggerActive)}
        >
          <CurrentBlockIcon className='h-3.5 w-3.5 shrink-0' />
          <span className='text-[11px]'>
            {t(`editor.bubble.blockTypes.${currentBlockType?.name || 'text'}`)}
          </span>
          <ChevronDownIcon className='h-2.5 w-2.5 shrink-0' />
        </button>

        {isTurnIntoOpen && (
          <div
            ref={turnIntoRef}
            className={cn(
              styles.dropdown,
              dropdownSide === 'top' && styles.dropdownTop,
              'left-0 w-[180px] overflow-y-auto'
            )}
            role='listbox'
            aria-label={t('editor.bubble.turnInto')}
          >
            {BLOCK_TYPES.map((blockType, index) => {
              const Icon = blockType.icon
              const isActive = currentBlockType?.name === blockType.name
              const isSelected = index === turnIntoSelectedIndex
              return (
                <button
                  key={blockType.name}
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  onClick={() => handleTurnIntoSelect(blockType)}
                  className={cn(styles.dropdownItem, isSelected && styles.dropdownItemSelected)}
                >
                  <div className='flex items-center gap-2'>
                    <Icon className='h-4 w-4 text-muted-foreground' />
                    <span>{t(`editor.bubble.blockTypes.${blockType.name}`)}</span>
                  </div>
                  {isActive && <CheckIcon className='h-4 w-4 text-foreground' />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.separator} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        isToggle
        aria-label={t('editor.bubble.bold')}
      >
        <Bold01Icon className='h-3.5 w-3.5' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        isToggle
        aria-label={t('editor.bubble.italic')}
      >
        <Italic01Icon className='h-3.5 w-3.5' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        isToggle
        aria-label={t('editor.bubble.underline')}
      >
        <TextUnderline className='h-3.5 w-3.5' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        isToggle
        aria-label={t('editor.bubble.strikethrough')}
      >
        <Strikethrough01Icon className='h-3.5 w-3.5' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        isToggle
        aria-label={t('editor.bubble.code')}
      >
        <Code01Icon className='h-3.5 w-3.5' />
      </ToolbarButton>

      <div className={styles.separator} />

      {/* Color Picker */}
      <div className='relative'>
        <ToolbarButton
          buttonRef={colorTriggerRef}
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'color' })}
          isActive={isColorPickerOpen}
          aria-haspopup='dialog'
          aria-expanded={isColorPickerOpen}
          aria-label={t('editor.bubble.textColor')}
        >
          <span className='flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold border border-current'>
            A
          </span>
        </ToolbarButton>

        {isColorPickerOpen && (
          <div
            className={cn(
              styles.dropdown,
              dropdownSide === 'top' && styles.dropdownTop,
              'left-0 w-[200px] py-1.5'
            )}
            role='dialog'
            aria-label={t('editor.bubble.textColor')}
          >
            <ColorSection title={t('editor.bubble.textColor')}>
              {getTextColors().map(item => {
                const currentColor = editor.getAttributes('textStyle').color || null
                const isActive = item.color === currentColor
                return (
                  <ColorButton
                    key={item.key}
                    label={item.label}
                    isActive={isActive}
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().setColor(item.color).run()
                      } else {
                        editor.chain().focus().unsetColor().run()
                      }
                      dispatch({ type: 'CLOSE_ALL' })
                    }}
                    preview={
                      <span
                        className='flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold border'
                        style={{
                          color: item.color || 'currentColor',
                          borderColor: item.color || 'currentColor'
                        }}
                      >
                        A
                      </span>
                    }
                  />
                )
              })}
            </ColorSection>

            <div className='h-px bg-border my-1.5' />

            <ColorSection title={t('editor.bubble.highlight')}>
              {getHighlightColors().map(item => {
                const currentHighlight = editor.getAttributes('highlight').color || null
                const isActive = item.color === currentHighlight
                return (
                  <ColorButton
                    key={item.key}
                    label={item.label}
                    isActive={isActive}
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().toggleHighlight({ color: item.color }).run()
                      } else {
                        editor.chain().focus().unsetHighlight().run()
                      }
                      dispatch({ type: 'CLOSE_ALL' })
                    }}
                    preview={
                      <span
                        className='flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold'
                        style={{
                          backgroundColor: item.color || 'transparent',
                          border: item.color ? 'none' : '1px dashed currentColor'
                        }}
                      >
                        A
                      </span>
                    }
                  />
                )
              })}
            </ColorSection>
          </div>
        )}
      </div>

      <div className={styles.separator} />

      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          dispatch({ type: 'SET_LINK_URL', url: previousUrl || '' })
          dispatch({ type: 'OPEN_MENU', menu: 'link' })
        }}
        isActive={editor.isActive('link')}
        aria-label={t('editor.bubble.link')}
      >
        <Link className='h-3.5 w-3.5' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onOpenMathDialog?.('inline')}
        isActive={editor.isActive('mathInline')}
        aria-label={t('editor.bubble.math')}
      >
        <MathOperations className='h-3.5 w-3.5' />
      </ToolbarButton>

      <div className={styles.separator} />

      {/* More Menu */}
      <div className='relative'>
        <ToolbarButton
          buttonRef={moreTriggerRef}
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'more' })}
          isActive={isMoreMenuOpen}
          aria-haspopup='menu'
          aria-expanded={isMoreMenuOpen}
          aria-label={t('editor.bubble.moreOptions')}
        >
          <DotsHorizontalIcon className='h-3.5 w-3.5' />
        </ToolbarButton>

        {isMoreMenuOpen && (
          <div
            ref={moreMenuRef}
            className={cn(
              styles.dropdown,
              dropdownSide === 'top' && styles.dropdownTop,
              'right-0 w-[160px]'
            )}
            role='menu'
            aria-label={t('editor.bubble.moreOptions')}
          >
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 0}
              onClick={() => handleMoreMenuSelect(moreMenuItems[0])}
              className={cn(
                styles.dropdownItem,
                moreMenuSelectedIndex === 0 && styles.dropdownItemSelected
              )}
            >
              <span>{t('editor.bubble.more.copy')}</span>
              <Copy01Icon className='h-4 w-4 text-muted-foreground' />
            </button>
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 1}
              onClick={() => handleMoreMenuSelect(moreMenuItems[1])}
              className={cn(
                styles.dropdownItem,
                moreMenuSelectedIndex === 1 && styles.dropdownItemSelected
              )}
            >
              <span>{t('editor.bubble.more.copyMarkdown')}</span>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </button>
            <div className='h-px bg-border/60 my-1' />
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 2}
              onClick={() => handleMoreMenuSelect(moreMenuItems[2])}
              className={cn(
                styles.dropdownItem,
                styles.deleteButton,
                moreMenuSelectedIndex === 2 && 'bg-destructive/10'
              )}
            >
              <span>{t('editor.bubble.more.delete')}</span>
              <Trash01Icon className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive: boolean
  children: React.ReactNode
  disabled?: boolean
  'aria-label'?: string
  /** For toggle buttons (Bold, Italic, etc.) */
  isToggle?: boolean
  /** For dropdown triggers */
  'aria-haspopup'?: 'menu' | 'listbox' | 'dialog' | boolean
  'aria-expanded'?: boolean
  /** Ref for positioning dropdowns */
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  disabled = false,
  isToggle = false,
  'aria-label': ariaLabel,
  'aria-haspopup': ariaHaspopup,
  'aria-expanded': ariaExpanded,
  buttonRef
}: ToolbarButtonProps) => {
  return (
    <button
      ref={buttonRef}
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isToggle ? isActive : undefined}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      className={cn(styles.toolbarButton, isActive && styles.toolbarButtonActive)}
    >
      {children}
    </button>
  )
}

/** Color picker section with title and list */
const ColorSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='px-2'>
    <span className='block text-[11px] font-medium text-muted-foreground px-1 mb-0.5'>{title}</span>
    <div className='space-y-0.5'>{children}</div>
  </div>
)

/** Color picker button item */
const ColorButton = ({
  label,
  isActive,
  onClick,
  preview
}: {
  label: string
  isActive: boolean
  onClick: () => void
  preview: React.ReactNode
}) => (
  <button
    type='button'
    onClick={onClick}
    className='flex w-full items-center justify-between px-1 py-1 rounded hover:bg-accent/40 transition-colors'
  >
    <div className='flex items-center gap-2'>
      {preview}
      <span className='text-[13px]'>{label}</span>
    </div>
    {isActive && <CheckIcon className='h-4 w-4 text-foreground' />}
  </button>
)
