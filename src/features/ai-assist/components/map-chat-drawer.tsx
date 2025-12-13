import { useEffect, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'
import {
  Drawer,
  DrawerContent
} from '@/shared/components/drawer'
import { useAIPanelStore } from '../model'
import { MapChatPanel } from './map-chat-panel'

interface MapChatDrawerProps {
  mapId: string
}

export const MapChatDrawer = ({ mapId }: MapChatDrawerProps) => {
  const { isOpen, close } = useAIPanelStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      <DrawerContent side="right" size="400px" showOverlay={false} showClose={true}>
        <div className="flex h-full flex-col pt-2">
          <MapChatPanel mapId={mapId} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
