import type { ComponentType, SVGProps } from 'react'
import {
  Atom01Icon,
  File01Icon,
  GraduationHat01Icon,
  HelpCircleIcon,
  Lightbulb01Icon,
  Target01Icon,
  User01Icon,
  ZapIcon
} from '@untitledui/icons-react/outline'
import type { NodeType } from '../node.schema'

export const getNodeIcon = (type: NodeType): ComponentType<SVGProps<SVGSVGElement>> => {
  const icons: Record<NodeType, ComponentType<SVGProps<SVGSVGElement>>> = {
    concept: Atom01Icon,
    fact: File01Icon,
    theory: Lightbulb01Icon,
    example: Target01Icon,
    question: HelpCircleIcon,
    hypothesis: ZapIcon,
    person: User01Icon,
    school: GraduationHat01Icon
  }
  return icons[type] || Atom01Icon
}
