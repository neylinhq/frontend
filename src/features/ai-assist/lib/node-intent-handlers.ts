import { aiApi, type EnrichType } from '@/entities/ai'
import { exerciseApi } from '@/entities/exercise'
import type {
  ChatContext,
  EnrichmentPreviewData,
  ExercisePreviewData,
  IntentHandler,
  IntentResult,
  NodeChatContext,
  PreviewCard
} from '../ai-assist.types'

const isNodeContext = (ctx: ChatContext): ctx is NodeChatContext => ctx.type === 'node'

export const enrichHandler: IntentHandler = {
  name: 'enrich',
  detect: (content: string) => /^\/(enrich|improve|description)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isNodeContext(ctx)) {
      return { content: 'This command is only available for nodes.' }
    }

    const enrichType: EnrichType = 'description'
    const result = await aiApi.enrichNode(ctx.mapId, ctx.nodeId, enrichType)

    const previews: PreviewCard[] = [
      {
        id: crypto.randomUUID(),
        type: 'enrichment',
        data: {
          field: enrichType,
          current: ctx.description || '',
          proposed: (result as { enrichedContent?: string })?.enrichedContent || ''
        } as EnrichmentPreviewData,
        status: 'pending'
      }
    ]

    return {
      content: "I've enriched the description. Review the changes below.",
      preview: previews
    }
  }
}

export const examplesHandler: IntentHandler = {
  name: 'examples',
  detect: (content: string) => /^\/(examples?|demos?)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isNodeContext(ctx)) {
      return { content: 'This command is only available for nodes.' }
    }

    const result = await aiApi.enrichNode(ctx.mapId, ctx.nodeId, 'examples')

    const previews: PreviewCard[] = [
      {
        id: crypto.randomUUID(),
        type: 'enrichment',
        data: {
          field: 'examples',
          current: '',
          proposed: (result as { enrichedContent?: string })?.enrichedContent || ''
        } as EnrichmentPreviewData,
        status: 'pending'
      }
    ]

    return {
      content: "I've generated examples. Review them below.",
      preview: previews
    }
  }
}

export const sourcesHandler: IntentHandler = {
  name: 'sources',
  detect: (content: string) => /^\/(sources?|references?)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isNodeContext(ctx)) {
      return { content: 'This command is only available for nodes.' }
    }

    const result = await aiApi.enrichNode(ctx.mapId, ctx.nodeId, 'sources')

    const previews: PreviewCard[] = [
      {
        id: crypto.randomUUID(),
        type: 'enrichment',
        data: {
          field: 'sources',
          current: '',
          proposed: (result as { enrichedContent?: string })?.enrichedContent || ''
        } as EnrichmentPreviewData,
        status: 'pending'
      }
    ]

    return {
      content: "I've found sources. Review them below.",
      preview: previews
    }
  }
}

export const exercisesHandler: IntentHandler = {
  name: 'exercises',
  detect: (content: string) => /^\/(exercises?|quiz)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isNodeContext(ctx)) {
      return { content: 'This command is only available for nodes.' }
    }

    const exercises = await exerciseApi.generateExercises(ctx.mapId, {
      nodeIds: [ctx.nodeId],
      difficulty: 3,
      count: 5
    })

    const previews: PreviewCard[] = exercises.map((exercise, index) => ({
      id: crypto.randomUUID(),
      type: 'exercise' as const,
      data: {
        exercise,
        index,
        total: exercises.length
      } as ExercisePreviewData,
      status: 'pending' as const
    }))

    return {
      content: `I've generated ${previews.length} exercises. Review and save the ones you like.`,
      preview: previews
    }
  }
}

export const nodeIntentHandlers: IntentHandler[] = [
  enrichHandler,
  examplesHandler,
  sourcesHandler,
  exercisesHandler
]
