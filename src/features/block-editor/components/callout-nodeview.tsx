import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { AlertTriangle, CheckCircle, Info, Lightbulb, XCircle } from 'lucide-react'
import type { CalloutType } from '../lib/callout-extension'

const CALLOUT_ICONS: Record<CalloutType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  tip: Lightbulb
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
