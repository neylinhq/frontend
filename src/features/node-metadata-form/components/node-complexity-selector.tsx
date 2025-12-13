import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'
import { COMPLEXITY_OPTIONS } from '../model/node-metadata-form.constants'

interface NodeComplexitySelectorProps {
  value?: string
  onChange: (value: string) => void
}

export const NodeComplexitySelector = ({ value, onChange }: NodeComplexitySelectorProps) => {
  const { t } = useTranslation()

  return (
    <div className='space-y-3'>
      <Label htmlFor='complexity'>{t('form.complexity.label')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id='complexity'>
          <SelectValue placeholder={t('form.complexity.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          {COMPLEXITY_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
