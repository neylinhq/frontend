import { LayoutRightIcon } from '@untitledui/icons-react/outline'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { useMapSidebarStore } from '../model'

export const SidebarToggleFab = memo(function SidebarToggleFab() {
  const { t } = useTranslation()
  const { isOpen, toggle } = useMapSidebarStore()

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={toggle}
      className='absolute right-4 top-4 z-10 h-9 w-9 bg-background/80 backdrop-blur-sm'
      title={isOpen ? t('mapSidebar.close') : t('mapSidebar.open')}
    >
      <LayoutRightIcon className='h-4 w-4' />
    </Button>
  )
})
