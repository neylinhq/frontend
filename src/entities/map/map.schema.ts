import { z } from 'zod'

export const MapEntitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
  nodesCount: z.number(),
  previewUrl: z.string().optional()
})

export type MapEntity = z.infer<typeof MapEntitySchema>
