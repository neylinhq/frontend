import { aiApi } from '@/entities/ai'
import type { ChatContext, IntentHandler, IntentResult, MapChatContext } from '../model/ai-assist.types'

const isMapContext = (ctx: ChatContext): ctx is MapChatContext => ctx.type === 'map'

export const analyzeHandler: IntentHandler = {
  name: 'analyze',
  detect: (content: string) => /^\/(analyze|analysis)/i.test(content.trim()),
  execute: async (ctx, _content, model): Promise<IntentResult> => {
    if (!isMapContext(ctx)) {
      return { content: 'This command is only available for maps.' }
    }

    await aiApi.analyzeMap(ctx.mapId, model)

    return {
      content: `Analysis started for "${ctx.mapName}". This may take a moment...`
    }
  }
}

export const suggestHandler: IntentHandler = {
  name: 'suggest',
  detect: (content: string) => /^\/(suggest|connections?|edges?)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isMapContext(ctx)) {
      return { content: 'This command is only available for maps.' }
    }

    await aiApi.suggestEdges(ctx.mapId)

    return {
      content: `I've analyzed "${ctx.mapName}" and found potential connections. Check the suggestions panel.`
    }
  }
}

export const gapsHandler: IntentHandler = {
  name: 'gaps',
  detect: (content: string) => /^\/(gaps?|missing)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isMapContext(ctx)) {
      return { content: 'This command is only available for maps.' }
    }

    await aiApi.detectGaps(ctx.mapId)

    return {
      content: `I've analyzed "${ctx.mapName}" for knowledge gaps. Check the results below.`
    }
  }
}

export const summaryHandler: IntentHandler = {
  name: 'summary',
  detect: (content: string) => /^\/(summary|overview)/i.test(content.trim()),
  execute: async (ctx, _content, _model): Promise<IntentResult> => {
    if (!isMapContext(ctx)) {
      return { content: 'This command is only available for maps.' }
    }

    return {
      content: `**${ctx.mapName}**\n\nThis map contains ${ctx.nodeCount} nodes. Use /analyze for a detailed analysis or /gaps to find missing topics.`
    }
  }
}

export const mapIntentHandlers: IntentHandler[] = [
  analyzeHandler,
  suggestHandler,
  gapsHandler,
  summaryHandler
]
