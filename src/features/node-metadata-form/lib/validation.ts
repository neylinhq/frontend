import { z } from 'zod'

export const nodeMetadataFormSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label is too long'),
  type: z.enum(['concept', 'fact', 'theory', 'example', 'question', 'hypothesis', 'person', 'school']),
  tags: z.array(z.string()).optional(),
  complexity: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  confidence: z.number().min(0).max(1).optional()
})

export type NodeMetadataFormValues = z.infer<typeof nodeMetadataFormSchema>
