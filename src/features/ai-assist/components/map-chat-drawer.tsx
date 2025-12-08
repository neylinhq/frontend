import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/shared/components/drawer'
import { MapChatPanel } from './map-chat-panel'

interface MapChatDrawerProps {
  mapId: string
}

export const MapChatDrawer = ({ mapId }: MapChatDrawerProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sparkles className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right" size="400px" showOverlay={false} showClose={true}>
        <div className="flex h-full flex-col">
          <DrawerHeader className="flex h-14 shrink-0 items-center justify-center border-b px-4">
            <DrawerTitle className="text-sm font-medium">
              {t('ai.assistant', 'AI Assistant')}
            </DrawerTitle>
          </DrawerHeader>
          <MapChatPanel mapId={mapId} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
