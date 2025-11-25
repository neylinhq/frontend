import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

interface NodeComplexitySelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function NodeComplexitySelector({ value, onChange }: NodeComplexitySelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <Label htmlFor="complexity">{t('form.complexity.label')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="complexity">
          <SelectValue placeholder={t('form.complexity.placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basic">{t('form.complexity.basic')}</SelectItem>
          <SelectItem value="intermediate">{t('form.complexity.intermediate')}</SelectItem>
          <SelectItem value="advanced">{t('form.complexity.advanced')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
