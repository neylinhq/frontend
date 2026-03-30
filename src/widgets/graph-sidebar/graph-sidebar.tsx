import { XCloseIcon } from '@untitledui/icons-react/outline'
import {
  Children,
  type ReactElement,
  type ReactNode,
  isValidElement,
  memo,
  useCallback,
  useMemo
} from 'react'
import { useTranslation } from 'react-i18next'

import {
  useMapActions,
  useMapActiveTab,
  useMapUIStore,
  useSidebarOpen,
  useSidebarWidth
} from '@/entities/map-ui'
import { FloatingLayer } from '@/shared/components/floating-layer'
import { OverflowNav, type OverflowNavItem } from '@/shared/components/overflow-nav'
import { ResizableSidebar } from '@/shared/components/resizable-sidebar'
import { cn } from '@/shared/lib/cn'

import type { GraphSidebarTab } from './graph-sidebar.types'

// ─── Panel ───────────────────────────────────────────────────────────

interface PanelProps {
  /** Unique tab identifier */
  id: string
  /** Tab label text */
  label: string
  /** Tab icon component */
  icon?: React.ComponentType<{ className?: string }>
  /** Header actions rendered when this tab is active */
  headerActions?: ReactNode
  /** Panel content */
  children: ReactNode
}

/**
 * Declarative panel registration. Renders nothing by itself —
 * GraphSidebar reads children of this type to build tabs and content.
 */
const Panel = (_props: PanelProps) => null
Panel.displayName = 'GraphSidebar.Panel'

// ─── FloatingItem ────────────────────────────────────────────────────

interface FloatingItemProps {
  /** Position relative to sidebar edge */
  position: 'top-right' | 'bottom-right'
  children: ReactNode
}

/**
 * FABs that stick to the sidebar edge. Uses FloatingLayer internally.
 * Rendered by GraphSidebar outside the sidebar panel.
 */
const FloatingItem = (_props: FloatingItemProps) => null
FloatingItem.displayName = 'GraphSidebar.FloatingItem'

// ─── ToggleFab ───────────────────────────────────────────────────────

interface ToggleFabProps {
  className?: string
}

/**
 * Default sidebar toggle button. Placed in FloatingLayer top-right.
 */
const ToggleFab = (_props: ToggleFabProps) => null
ToggleFab.displayName = 'GraphSidebar.ToggleFab'

// ─── Helpers ─────────────────────────────────────────────────────────

function collectChildren(children: ReactNode) {
  const panels: ReactElement<PanelProps>[] = []
  const floatingItems: ReactElement<FloatingItemProps>[] = []
  let hasToggleFab = false

  Children.forEach(children, child => {
    if (!isValidElement(child)) return
    if (child.type === Panel) {
      panels.push(child as ReactElement<PanelProps>)
    } else if (child.type === FloatingItem) {
      floatingItems.push(child as ReactElement<FloatingItemProps>)
    } else if (child.type === ToggleFab) {
      hasToggleFab = true
    }
  })

  return { panels, floatingItems, hasToggleFab }
}

// ─── GraphSidebar (shell) ────────────────────────────────────────────

interface GraphSidebarProps {
  /** Map ID for per-map tab state */
  mapId: string
  /** Compound component children: Panel, FloatingItem, ToggleFab */
  children: ReactNode
  className?: string
}

const GraphSidebarRoot = memo(function GraphSidebarRoot({
  mapId,
  children,
  className
}: GraphSidebarProps) {
  const { t } = useTranslation()
  const isOpen = useSidebarOpen()
  const width = useSidebarWidth()
  const activeTab = useMapActiveTab(mapId)
  const { setActiveTab } = useMapActions(mapId)

  const { panels, floatingItems, hasToggleFab } = useMemo(
    () => collectChildren(children),
    [children]
  )

  const handleClose = useCallback(() => {
    useMapUIStore.getState().setSidebarOpen(false)
  }, [])

  const setTab = useCallback(
    (tab: GraphSidebarTab) => {
      setActiveTab(tab as any)
      useMapUIStore.getState().setSidebarOpen(true)
    },
    [setActiveTab]
  )

  const handleSetWidth = useCallback((w: number) => {
    useMapUIStore.getState().setSidebarWidth(w)
  }, [])

  // Build nav items from Panel children
  const navItems = useMemo(() => {
    return panels.map((panel): OverflowNavItem => ({
      id: panel.props.id,
      label: panel.props.label,
      active: activeTab === panel.props.id,
      onClick: () => setTab(panel.props.id)
    }))
  }, [panels, activeTab, setTab])

  const { nav, trigger } = OverflowNav({ items: navItems })

  // Active panel
  const activePanel = panels.find(p => p.props.id === activeTab) ?? panels[0]

  // ─── Render floating items (always, even when sidebar closed) ──────

  const floatingContent = (
    <FloatingLayer.Root>
      {hasToggleFab && (
        <FloatingLayer.Item position='top-right'>
          <SidebarToggleFabInternal />
        </FloatingLayer.Item>
      )}
      {floatingItems.map((item, i) => (
        <FloatingLayer.Item key={i} position={item.props.position}>
          {item.props.children}
        </FloatingLayer.Item>
      ))}
    </FloatingLayer.Root>
  )

  // ─── Render sidebar panel ──────────────────────────────────────────

  const sidebarContent = isOpen ? (
    <ResizableSidebar
      open={isOpen}
      onClose={handleClose}
      width={width}
      onWidthChange={handleSetWidth}
      className={className}
    >
      <div className='flex flex-1 flex-col min-h-0'>
        {/* Nav bar */}
        <div className='flex items-center border-b border-border/60 px-2 py-1 shrink-0'>
          {nav}
          <div className='flex items-center shrink-0'>
            {/* Active panel header actions */}
            {activePanel?.props.headerActions}
            {trigger}
            <button
              type='button'
              onClick={handleClose}
              className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
            >
              <XCloseIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className='flex-1 min-h-0 overflow-hidden'>
          {activePanel && (
            <div className={cn(
              'h-full',
              activeTab === 'chat' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
            )}>
              {activePanel.props.children}
            </div>
          )}
        </div>
      </div>
    </ResizableSidebar>
  ) : null

  return (
    <>
      {floatingContent}
      {sidebarContent}
    </>
  )
})

// ─── Internal toggle fab ─────────────────────────────────────────────

import { LayoutRightIcon } from '@untitledui/icons-react/outline'
import { Button } from '@/shared/components/button'

const SidebarToggleFabInternal = memo(function SidebarToggleFabInternal() {
  const { t } = useTranslation()
  const isOpen = useSidebarOpen()

  const toggle = useCallback(() => {
    useMapUIStore.getState().toggleSidebar()
  }, [])

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={toggle}
      className='h-9 w-9 bg-background/80 backdrop-blur-sm'
      title={isOpen ? t('mapSidebar.close') : t('mapSidebar.open')}
    >
      <LayoutRightIcon className='h-4 w-4' />
    </Button>
  )
})

// ─── Compound export ─────────────────────────────────────────────────

export const GraphSidebar = Object.assign(GraphSidebarRoot, {
  Panel,
  FloatingItem,
  ToggleFab
})
