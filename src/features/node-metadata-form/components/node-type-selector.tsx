import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Brain, FileText, Lightbulb, BookOpen, HelpCircle, FlaskConical, User, GraduationCap } from 'lucide-react'
import type { NodeType } from '@/entities/node'

const nodeTypeValues: NodeType[] = ['concept', 'fact', 'theory', 'example', 'question', 'hypothesis', 'person', 'school']

const nodeTypeIcons: Record<NodeType, React.ReactNode> = {
  concept: <Brain className="h-4 w-4" />,
  fact: <FileText className="h-4 w-4" />,
  theory: <Lightbulb className="h-4 w-4" />,
  example: <BookOpen className="h-4 w-4" />,
  question: <HelpCircle className="h-4 w-4" />,
  hypothesis: <FlaskConical className="h-4 w-4" />,
  person: <User className="h-4 w-4" />,
  school: <GraduationCap className="h-4 w-4" />,
}

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
          {nodeTypeValues.map((typeValue) => (
            <div key={typeValue} className="flex items-center space-x-2">
              <RadioGroupItem value={typeValue} id={`type-${typeValue}`} />
              <Label
                htmlFor={`type-${typeValue}`}
                className="flex cursor-pointer items-center gap-2 font-normal"
              >
                {nodeTypeIcons[typeValue]}
                {t(`nodeTypes.${typeValue}`)}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
