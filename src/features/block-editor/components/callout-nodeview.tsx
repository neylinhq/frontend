import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoCircleIcon,
  Lightbulb01Icon,
  XCircleIcon
} from '@untitledui/icons-react/outline'
import type { CalloutType } from '../lib/callout-extension'

const CALLOUT_ICONS: Record<CalloutType, React.ComponentType<{ className?: string }>> = {
  info: InfoCircleIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
  error: XCircleIcon,
  tip: Lightbulb01Icon
}

export const CalloutNodeView = ({ node }: NodeViewProps) => {
  const type = (node.attrs.type as CalloutType) || 'info'
  const Icon = CALLOUT_ICONS[type] || CALLOUT_ICONS.info

  return (
    <NodeViewWrapper className={`callout callout-${type}`}>
      <Icon className='callout-icon' aria-hidden='true' />
      <NodeViewContent className='callout-content' />
    </NodeViewWrapper>
  )
}
