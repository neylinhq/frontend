import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { Brain, FileText, Lightbulb, BookOpen, HelpCircle, FlaskConical } from 'lucide-react'
import type { NodeType } from '@/entities/node'

const nodeTypes: Array<{ value: NodeType; label: string; icon: React.ReactNode }> = [
  { value: 'concept', label: 'Concept', icon: <Brain className="h-4 w-4" /> },
  { value: 'fact', label: 'Fact', icon: <FileText className="h-4 w-4" /> },
  { value: 'theory', label: 'Theory', icon: <Lightbulb className="h-4 w-4" /> },
  { value: 'example', label: 'Example', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'question', label: 'Question', icon: <HelpCircle className="h-4 w-4" /> },
  { value: 'hypothesis', label: 'Hypothesis', icon: <FlaskConical className="h-4 w-4" /> }
]

interface NodeTypeSelectorProps {
  value: NodeType
  onChange: (value: NodeType) => void
}

export function NodeTypeSelector({ value, onChange }: NodeTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Node Type</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-2 gap-2">
          {nodeTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={`type-${type.value}`} />
              <Label
                htmlFor={`type-${type.value}`}
                className="flex cursor-pointer items-center gap-2 font-normal"
              >
                {type.icon}
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
