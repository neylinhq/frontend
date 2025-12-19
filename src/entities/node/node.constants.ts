import type { ComponentType, SVGProps } from 'react'
import {
  BookOpen01Icon,
  Atom01Icon,
  File01Icon,
  Beaker01Icon,
  GraduationHat01Icon,
  HelpCircleIcon,
  Lightbulb01Icon,
  User01Icon
} from '@untitledui/icons-react/outline'
import type { NodeType } from './node.schema'

export interface NodeTypeConfig {
  type: NodeType
  icon: ComponentType<SVGProps<SVGSVGElement>>
  labelKey: string
}

export const NODE_TYPE_CONFIGS: NodeTypeConfig[] = [
  { type: 'concept', icon: Atom01Icon, labelKey: 'nodeTypes.concept' },
  { type: 'fact', icon: File01Icon, labelKey: 'nodeTypes.fact' },
  { type: 'theory', icon: Lightbulb01Icon, labelKey: 'nodeTypes.theory' },
  { type: 'example', icon: BookOpen01Icon, labelKey: 'nodeTypes.example' },
  { type: 'question', icon: HelpCircleIcon, labelKey: 'nodeTypes.question' },
  { type: 'hypothesis', icon: Beaker01Icon, labelKey: 'nodeTypes.hypothesis' },
  { type: 'person', icon: User01Icon, labelKey: 'nodeTypes.person' },
  { type: 'school', icon: GraduationHat01Icon, labelKey: 'nodeTypes.school' }
]
