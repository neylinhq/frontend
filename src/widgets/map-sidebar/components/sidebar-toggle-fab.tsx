import { LayoutRightIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useMapUIStore, useSidebarOpen } from '@/entities/map-ui'
import { Button } from '@/shared/components/button'

export const SidebarToggleFab = memo(function SidebarToggleFab() {
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
