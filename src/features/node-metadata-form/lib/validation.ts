import { z } from 'zod'
import { ComplexityEnum, NodeTypeEnum } from '@/entities/node'

export const nodeMetadataFormSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label is too long'),
  type: NodeTypeEnum,
  tags: z.array(z.string()).optional(),
  complexity: ComplexityEnum.optional(),
  confidence: z.number().min(0).max(1).optional()
})

export type NodeMetadataFormValues = z.infer<typeof nodeMetadataFormSchema>
