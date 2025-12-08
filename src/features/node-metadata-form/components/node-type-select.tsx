import { useTranslation } from 'react-i18next'
import { NODE_TYPE_CONFIGS, type NodeType } from '@/entities/node'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'

interface NodeTypeSelectProps {
  value: NodeType
  onChange: (value: NodeType) => void
}

export const NodeTypeSelect = ({ value, onChange }: NodeTypeSelectProps) => {
  const { t } = useTranslation()

  const selectedConfig = NODE_TYPE_CONFIGS.find(c => c.type === value)
  const SelectedIcon = selectedConfig?.icon

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {selectedConfig && (
            <span className="flex items-center gap-2">
              {SelectedIcon && <SelectedIcon className="h-4 w-4 text-muted-foreground" />}
              {t(selectedConfig.labelKey)}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {NODE_TYPE_CONFIGS.map(config => {
          const Icon = config.icon
          return (
            <SelectItem key={config.type} value={config.type}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {t(config.labelKey)}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
