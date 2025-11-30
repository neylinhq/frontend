import {
  Brain,
  FileText,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  type LucideIcon,
  Target,
  User,
  Zap
} from 'lucide-react'
import type { NodeType } from '../node.schema'

export const getNodeIcon = (type: NodeType): LucideIcon => {
  const icons: Record<NodeType, LucideIcon> = {
    concept: Brain,
    fact: FileText,
    theory: Lightbulb,
    example: Target,
    question: HelpCircle,
    hypothesis: Zap,
    person: User,
    school: GraduationCap
  }
  return icons[type] || Brain
}
