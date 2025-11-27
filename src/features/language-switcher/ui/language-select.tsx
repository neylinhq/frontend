import { useTranslation } from 'react-i18next'
import { SelectPopover } from '@/shared/ui/select-popover'
import { LANGUAGES } from '../language-switcher.constants'

type LanguageSelectProps = {
  compact?: boolean
}

export function LanguageSelect({ compact }: LanguageSelectProps) {
  const { i18n } = useTranslation()

  const items = LANGUAGES.map(lang => ({
    value: lang.id,
    label: lang.label,
    icon: (
      <lang.Flag className="h-4 w-4 rounded-full object-cover border border-border" />
    )
  }))

  return (
    <SelectPopover
      items={items}
      value={i18n.language}
      onChange={lng => i18n.changeLanguage(lng)}
      compact={compact}
      align="end"
    />
  )
}
