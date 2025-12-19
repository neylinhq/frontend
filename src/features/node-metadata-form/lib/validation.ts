import { z } from 'zod'
import { NodeTypeEnum } from '@/entities/node'

export const nodeMetadataFormSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label is too long'),
  type: NodeTypeEnum,
  tags: z.array(z.string()).optional()
})

export type NodeMetadataFormValues = z.infer<typeof nodeMetadataFormSchema>
