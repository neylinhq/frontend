import { useCallback, useEffect, useRef, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'
import {
  Drawer,
  DrawerContent
} from '@/shared/components/drawer'
import { cn } from '@/shared/lib/cn'
import { useAIPanelStore } from '../model'
import { MapChatPanel } from './map-chat-panel'

const STORAGE_KEY = 'ai-panel-width'
const MIN_WIDTH = 300
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 400

interface MapChatDrawerProps {
  mapId: string
}

export const MapChatDrawer = ({ mapId }: MapChatDrawerProps) => {
  const { isOpen, close } = useAIPanelStore()
  const [isMobile, setIsMobile] = useState(false)
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDTH
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(saved, 10))) : DEFAULT_WIDTH
  })
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(width)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Save width to localStorage
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem(STORAGE_KEY, String(width))
    }
  }, [width, isResizing])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }, [width])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      // Resize from left edge: moving left increases width
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (isMobile) {
    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && close()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <VaulDrawer.Content className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col rounded-t-xl bg-background">
            {/* Drag handle for swipe-to-close */}
            <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
            <div className="flex-1 overflow-hidden">
              <MapChatPanel mapId={mapId} />
            </div>
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()} modal={false}>
      <DrawerContent
        side="right"
        size={`${width}px`}
        showOverlay={false}
        showClose={true}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Resize handle */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1 cursor-ew-resize',
            'hover:bg-primary/20 active:bg-primary/30',
            'transition-colors',
            isResizing && 'bg-primary/30'
          )}
          onMouseDown={handleMouseDown}
        />
        <div className="flex h-full flex-col pt-2 pl-1">
          <MapChatPanel mapId={mapId} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
