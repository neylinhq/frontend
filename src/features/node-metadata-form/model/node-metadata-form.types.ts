import type { Node } from '@/entities/node'

import type { NodeMetadataFormValues } from '../lib/validation'

export interface NodeMetadataFormProps {
  node: Node
  onSubmit: (values: NodeMetadataFormValues) => void
  isPending?: boolean
  disabled?: boolean
}
