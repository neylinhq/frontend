import { Check, Globe } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/app/i18n'
import { Button } from '@/shared/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { cn } from '@/shared/lib/cn'
import { LANGUAGES } from '../language-switcher.constants'

type LanguageSelectProps = {
  compact?: boolean
}

export const LanguageSelect = ({ compact }: LanguageSelectProps) => {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleSelect = (lng: string) => {
    if (lng === i18n.language) {
      setOpen(false)
      return
    }
    changeLanguage(lng)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='sm' className={compact ? 'px-2' : undefined}>
          <Globe className='h-4 w-4' />
          {!compact && (
            <span className='ml-1.5'>{LANGUAGES.find(l => l.id === i18n.language)?.label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='center' className='w-auto min-w-[140px] p-1'>
        <div className='flex flex-col'>
          {LANGUAGES.map(lang => (
            <button
              type='button'
              key={lang.id}
              onClick={() => handleSelect(lang.id)}
              className={cn(
                'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:bg-accent focus-visible:text-accent-foreground',
                'cursor-pointer transition-colors'
              )}
            >
              <span className='flex-1 text-left'>{lang.label}</span>
              {i18n.language === lang.id && <Check className='h-4 w-4 text-brand flex-shrink-0' />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
