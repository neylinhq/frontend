import { Globe01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/app/i18n'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { LANGUAGES } from '../language-switcher.constants'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const handleChange = (lng: string) => {
    if (lng === i18n.language) {
      return
    }
    changeLanguage(lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9'>
          <Globe01Icon className='h-4 w-4' />
          <span className='sr-only'>Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {LANGUAGES.map(lang => (
          <DropdownMenuItem key={lang.id} onClick={() => handleChange(lang.id)}>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
