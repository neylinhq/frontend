import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import type { NodeType } from '@/entities/node'
import { NODE_TYPE_CONFIGS } from '../model/node-type-selector.constants'

interface NodeTypeSelectorProps {
  value: NodeType
  onChange: (value: NodeType) => void
}

export function NodeTypeSelector({ value, onChange }: NodeTypeSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <Label>{t('form.nodeType.label')}</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 gap-2">
          {NODE_TYPE_CONFIGS.map((config) => {
            const Icon = config.icon
            return (
              <div key={config.type} className="flex items-center space-x-2">
                <RadioGroupItem value={config.type} id={`type-${config.type}`} />
                <Label
                  htmlFor={`type-${config.type}`}
                  className="flex cursor-pointer items-center gap-2 font-normal"
                >
                  <Icon className="h-4 w-4" />
                  {t(config.labelKey)}
                </Label>
              </div>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
