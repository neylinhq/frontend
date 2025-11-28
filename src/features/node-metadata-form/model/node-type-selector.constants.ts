import {
  BookOpen,
  Brain,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  type LucideIcon,
  User
} from 'lucide-react'
import type { NodeType } from '@/entities/node'

export interface NodeTypeConfig {
  type: NodeType
  icon: LucideIcon
  labelKey: string
}

export const NODE_TYPE_CONFIGS: NodeTypeConfig[] = [
  {
    type: 'concept',
    icon: Brain,
    labelKey: 'nodeTypes.concept'
  },
  {
    type: 'fact',
    icon: FileText,
    labelKey: 'nodeTypes.fact'
  },
  {
    type: 'theory',
    icon: Lightbulb,
    labelKey: 'nodeTypes.theory'
  },
  {
    type: 'example',
    icon: BookOpen,
    labelKey: 'nodeTypes.example'
  },
  {
    type: 'question',
    icon: HelpCircle,
    labelKey: 'nodeTypes.question'
  },
  {
    type: 'hypothesis',
    icon: FlaskConical,
    labelKey: 'nodeTypes.hypothesis'
  },
  {
    type: 'person',
    icon: User,
    labelKey: 'nodeTypes.person'
  },
  {
    type: 'school',
    icon: GraduationCap,
    labelKey: 'nodeTypes.school'
  }
]
