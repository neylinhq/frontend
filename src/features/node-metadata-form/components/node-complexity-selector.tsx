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
  return (
    <div className="space-y-2">
      <Label htmlFor="complexity">Complexity</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="complexity">
          <SelectValue placeholder="Select complexity level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basic">Basic</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
