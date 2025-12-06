import type { Editor } from '@tiptap/react'
import {
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  Copy,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  MoreHorizontal,
  Palette,
  Quote,
  Redo2,
  Sigma,
  Strikethrough,
  Subscript,
  Superscript,
  Trash2,
  Type,
  Underline,
  Undo2
} from 'lucide-react'
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
import { toast } from '@/shared/components/toast'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'
import { copyAsMarkdown } from '../lib/markdown-serializer'
import { MENU } from '../model/block-editor.constants'

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
  }, [isOpen, items.length])

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const selectedEl = containerRef.current.querySelector('[data-selected="true"]')
    selectedEl?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, selectedIndex, containerRef])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

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
    icon: Type,
    command: (editor: Editor) => editor.chain().focus().setParagraph().run()
  },
  {
    name: 'heading1',
    icon: Heading1,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    name: 'heading2',
    icon: Heading2,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    name: 'heading3',
    icon: Heading3,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    name: 'bulletList',
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    name: 'numberedList',
    icon: ListOrdered,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    name: 'todoList',
    icon: CheckSquare,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run()
  },
  {
    name: 'quote',
    icon: Quote,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run()
  }
]

const TEXT_COLORS = [
  { key: 'default', color: null },
  { key: 'gray', color: '#6b7280' },
  { key: 'brown', color: '#92400e' },
  { key: 'orange', color: '#ea580c' },
  { key: 'yellow', color: '#ca8a04' },
  { key: 'green', color: '#16a34a' },
  { key: 'blue', color: '#2563eb' },
  { key: 'purple', color: '#9333ea' },
  { key: 'pink', color: '#db2777' },
  { key: 'red', color: '#dc2626' }
]

const HIGHLIGHT_COLORS = [
  { key: 'default', color: null },
  { key: 'gray', color: '#e5e7eb' },
  { key: 'brown', color: '#fef3c7' },
  { key: 'orange', color: '#ffedd5' },
  { key: 'yellow', color: '#fef9c3' },
  { key: 'green', color: '#dcfce7' },
  { key: 'blue', color: '#dbeafe' },
  { key: 'purple', color: '#f3e8ff' },
  { key: 'pink', color: '#fce7f3' },
  { key: 'red', color: '#fee2e2' }
]

const BLOCK_BACKGROUND_COLORS = [
  { key: 'default', color: null },
  { key: 'gray', color: '#f3f4f6' },
  { key: 'yellow', color: '#fef3c7' },
  { key: 'green', color: '#dcfce7' },
  { key: 'blue', color: '#dbeafe' },
  { key: 'purple', color: '#f3e8ff' },
  { key: 'pink', color: '#fce7f3' },
  { key: 'red', color: '#fee2e2' }
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
  const moreMenuRef = useRef<HTMLDivElement>(null)

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
          try {
            await navigator.clipboard.writeText(text)
            toast.success(t('editor.bubble.more.copied'))
          } catch {
            toast.error(t('editor.bubble.more.copyFailed'))
          }
          break
        }
        case 'copyMarkdown': {
          const json = editor.getJSON()
          const success = await copyAsMarkdown(json)
          if (success) {
            toast.success(t('editor.bubble.more.copiedMarkdown'))
          } else {
            toast.error(t('editor.bubble.more.copyFailed'))
          }
          break
        }
        case 'delete':
          editor.chain().focus().deleteSelection().run()
          break
      }
      dispatch({ type: 'CLOSE_ALL' })
    },
    [editor, t]
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

  // FIX: Wrap updateMenu in useCallback to prevent memory leak from event listener accumulation
  // Previously, updateMenu was created inside useEffect, causing cleanup to use stale references
  const updateMenu = useCallback(() => {
    const { selection } = editor.state
    const { empty, from, to } = selection

    // Hide menu if selection is empty or is a node selection
    if (empty || from === to) {
      setIsVisible(false)
      dispatch({ type: 'CLOSE_ALL' })
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

    // Ensure menu doesn't go above viewport - clamp to minimum padding
    if (top - MENU.BUBBLE_HEIGHT < MENU.VIEWPORT_PADDING) {
      top = MENU.BUBBLE_HEIGHT + MENU.VIEWPORT_PADDING
    }

    setPosition({ top, left })
    setIsVisible(true)
    // Force re-render to update block type in Turn Into dropdown
    forceUpdate()
  }, [editor, forceUpdate])

  useEffect(() => {
    editor.on('selectionUpdate', updateMenu)
    editor.on('transaction', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('transaction', updateMenu)
    }
  }, [editor, updateMenu])

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
    if (editor.isActive('heading', { level: 1 })) return BLOCK_TYPES[1]
    if (editor.isActive('heading', { level: 2 })) return BLOCK_TYPES[2]
    if (editor.isActive('heading', { level: 3 })) return BLOCK_TYPES[3]
    if (editor.isActive('bulletList')) return BLOCK_TYPES[4]
    if (editor.isActive('orderedList')) return BLOCK_TYPES[5]
    if (editor.isActive('taskList')) return BLOCK_TYPES[6]
    if (editor.isActive('blockquote')) return BLOCK_TYPES[7]
    return BLOCK_TYPES[0]
  }
  const currentBlockType = getCurrentBlockType()
  const CurrentBlockIcon = currentBlockType?.icon || Type

  if (!isVisible) {
    return null
  }

  if (isLinkInputOpen) {
    return (
      <div
        ref={menuRef}
        className='absolute z-50 flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg'
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
          className='h-8 w-48 rounded-md border-none bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground'
        />
        <Button variant='ghost' size='sm' onClick={setLink} className='h-8 px-2 text-xs'>
          {t('editor.bubble.save')}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => dispatch({ type: 'CLOSE_ALL' })}
          className='h-8 px-2 text-xs'
        >
          {t('editor.bubble.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className='absolute z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg'
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        isActive={false}
        disabled={!editor.can().undo()}
        aria-label={t('editor.bubble.undo')}
      >
        <Undo2 className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        isActive={false}
        disabled={!editor.can().redo()}
        aria-label={t('editor.bubble.redo')}
      >
        <Redo2 className='h-4 w-4' />
      </ToolbarButton>

      <div className='mx-1 h-6 w-px bg-border' />

      {/* Turn Into Dropdown */}
      <div className='relative'>
        <button
          type='button'
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'turnInto' })}
          aria-haspopup='listbox'
          aria-expanded={isTurnIntoOpen}
          aria-label={t('editor.bubble.turnInto')}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 whitespace-nowrap transition-colors',
            isTurnIntoOpen
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <CurrentBlockIcon className='h-4 w-4 shrink-0' />
          <span className='text-xs'>
            {t(`editor.bubble.blockTypes.${currentBlockType?.name || 'text'}`)}
          </span>
          <ChevronDown className='h-3 w-3 shrink-0' />
        </button>

        {isTurnIntoOpen && (
          <div
            ref={turnIntoRef}
            className='absolute left-0 top-full mt-1 z-50 min-w-[160px] max-h-[240px] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg'
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
                  onMouseEnter={() => {
                    // Update selection on hover for consistent UX
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors',
                    isSelected && 'bg-accent/70',
                    isActive && !isSelected && 'bg-accent text-accent-foreground',
                    !isActive && !isSelected && 'text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{t(`editor.bubble.blockTypes.${blockType.name}`)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className='mx-1 h-6 w-px bg-border' />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        isToggle
        aria-label={t('editor.bubble.bold')}
      >
        <Bold className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        isToggle
        aria-label={t('editor.bubble.italic')}
      >
        <Italic className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        isToggle
        aria-label={t('editor.bubble.underline')}
      >
        <Underline className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        isToggle
        aria-label={t('editor.bubble.strikethrough')}
      >
        <Strikethrough className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        isToggle
        aria-label={t('editor.bubble.code')}
      >
        <Code className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        isToggle
        aria-label={t('editor.bubble.highlightButton')}
      >
        <Highlighter className='h-4 w-4' />
      </ToolbarButton>

      <div className='mx-1 h-6 w-px bg-border' />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive('subscript')}
        isToggle
        aria-label={t('editor.bubble.subscript')}
      >
        <Subscript className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive('superscript')}
        isToggle
        aria-label={t('editor.bubble.superscript')}
      >
        <Superscript className='h-4 w-4' />
      </ToolbarButton>

      <div className='mx-1 h-6 w-px bg-border' />

      {/* Color Picker */}
      <div className='relative'>
        <ToolbarButton
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'color' })}
          isActive={isColorPickerOpen}
          aria-haspopup='dialog'
          aria-expanded={isColorPickerOpen}
          aria-label={t('editor.bubble.textColor')}
        >
          <Palette className='h-4 w-4' />
          <ChevronDown className='h-3 w-3' />
        </ToolbarButton>

        {isColorPickerOpen && (
          <div
            className='absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-border bg-popover p-2 shadow-lg'
            role='dialog'
            aria-label={t('editor.bubble.textColor')}
          >
            <div className='mb-2'>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                {t('editor.bubble.textColor')}
              </p>
              <div className='flex flex-wrap gap-1'>
                {TEXT_COLORS.map(item => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().setColor(item.color).run()
                      } else {
                        editor.chain().focus().unsetColor().run()
                      }
                      dispatch({ type: 'CLOSE_ALL' })
                    }}
                    className={cn(
                      'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                      item.color === null && 'bg-foreground'
                    )}
                    style={{ backgroundColor: item.color || undefined }}
                    title={t(`colors.${item.key}`)}
                  />
                ))}
              </div>
            </div>
            <div className='mb-2'>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                {t('editor.bubble.highlight')}
              </p>
              <div className='flex flex-wrap gap-1'>
                {HIGHLIGHT_COLORS.map(item => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().toggleHighlight({ color: item.color }).run()
                      } else {
                        editor.chain().focus().unsetHighlight().run()
                      }
                      dispatch({ type: 'CLOSE_ALL' })
                    }}
                    className={cn(
                      'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                      item.color === null && 'bg-transparent'
                    )}
                    style={{ backgroundColor: item.color || undefined }}
                    title={t(`colors.${item.key}`)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>
                {t('editor.bubble.blockBackground')}
              </p>
              <div className='flex flex-wrap gap-1'>
                {BLOCK_BACKGROUND_COLORS.map(item => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().setBlockColor(item.color).run()
                      } else {
                        editor.chain().focus().unsetBlockColor().run()
                      }
                      dispatch({ type: 'CLOSE_ALL' })
                    }}
                    className={cn(
                      'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                      item.color === null && 'bg-transparent'
                    )}
                    style={{ backgroundColor: item.color || undefined }}
                    title={t(`colors.${item.key}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='mx-1 h-6 w-px bg-border' />

      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          dispatch({ type: 'SET_LINK_URL', url: previousUrl || '' })
          dispatch({ type: 'OPEN_MENU', menu: 'link' })
        }}
        isActive={editor.isActive('link')}
        aria-label={t('editor.bubble.link')}
      >
        <Link className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onOpenMathDialog?.('inline')}
        isActive={editor.isActive('mathInline')}
        aria-label={t('editor.bubble.math')}
      >
        <Sigma className='h-4 w-4' />
      </ToolbarButton>

      <div className='mx-1 h-6 w-px bg-border' />

      {/* More Menu */}
      <div className='relative'>
        <ToolbarButton
          onClick={() => dispatch({ type: 'TOGGLE_MENU', menu: 'more' })}
          isActive={isMoreMenuOpen}
          aria-haspopup='menu'
          aria-expanded={isMoreMenuOpen}
          aria-label={t('editor.bubble.moreOptions')}
        >
          <MoreHorizontal className='h-4 w-4' />
        </ToolbarButton>

        {isMoreMenuOpen && (
          <div
            ref={moreMenuRef}
            className='absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg'
            role='menu'
            aria-label={t('editor.bubble.moreOptions')}
          >
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 0}
              onClick={() => handleMoreMenuSelect(moreMenuItems[0])}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left text-foreground transition-colors',
                moreMenuSelectedIndex === 0 ? 'bg-accent/70' : 'hover:bg-accent/50'
              )}
            >
              <Copy className='h-4 w-4' />
              <span>{t('editor.bubble.more.copy')}</span>
            </button>
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 1}
              onClick={() => handleMoreMenuSelect(moreMenuItems[1])}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left text-foreground transition-colors',
                moreMenuSelectedIndex === 1 ? 'bg-accent/70' : 'hover:bg-accent/50'
              )}
            >
              <FileText className='h-4 w-4' />
              <span>{t('editor.bubble.more.copyMarkdown')}</span>
            </button>
            <button
              type='button'
              role='menuitem'
              data-selected={moreMenuSelectedIndex === 2}
              onClick={() => handleMoreMenuSelect(moreMenuItems[2])}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left text-destructive transition-colors',
                moreMenuSelectedIndex === 2 ? 'bg-destructive/20' : 'hover:bg-destructive/10'
              )}
            >
              <Trash2 className='h-4 w-4' />
              <span>{t('editor.bubble.more.delete')}</span>
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
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  disabled = false,
  isToggle = false,
  'aria-label': ariaLabel,
  'aria-haspopup': ariaHaspopup,
  'aria-expanded': ariaExpanded
}: ToolbarButtonProps) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={isToggle ? isActive : undefined}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && isActive && 'bg-accent text-accent-foreground',
        !disabled && !isActive && 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
