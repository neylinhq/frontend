import { PlusIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { getShortcut } from '@/shared/lib/platform'
import { useNodeCreationStore } from '../model/node-creation.store'

export const AddNodeFab = () => {
  const { t } = useTranslation()
  const { openQuickAdd } = useNodeCreationStore()

  const shortcut = getShortcut({ mac: '⌘N', win: 'Ctrl+N' })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={openQuickAdd}
          size='icon'
          className='fixed bottom-6 right-6 h-14 w-14 rounded-full z-50'
          aria-label={t('nodeCreation.addNode')}
        >
          <PlusIcon className='h-6 w-6' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left' className='flex items-center gap-2'>
        <span>{t('nodeCreation.addNode')}</span>
        <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground'>
          {shortcut}
        </kbd>
      </TooltipContent>
    </Tooltip>
  )
}
