import { useTranslation } from 'react-i18next'
import { Sparkles, Lightbulb, Link2, FileQuestion } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface Suggestion {
  key: string
  icon: React.ReactNode
  text: string
}

interface ChatEmptyStateProps {
  /** Custom title. Falls back to i18n key */
  title?: string
  /** Callback when user clicks a suggestion */
  onSuggestionClick: (suggestion: string) => void
  /** Custom suggestions. Falls back to default node context suggestions */
  suggestions?: Suggestion[]
  /** Context type for default suggestions */
  context?: 'node' | 'map'
}

/**
 * Chat Empty State — S+ Design Pattern
 *
 * Design Philosophy:
 * - "Progressive disclosure" — show capabilities through actionable examples
 * - "Interface disappears, content shines" — minimal chrome, focus on suggestions
 * - Klikable suggestions that trigger actual AI queries
 */
export const ChatEmptyState = ({
  title,
  onSuggestionClick,
  suggestions: customSuggestions,
  context = 'node'
}: ChatEmptyStateProps) => {
  const { t } = useTranslation()

  const defaultNodeSuggestions: Suggestion[] = [
    {
      key: 'explain',
      icon: <Lightbulb className="h-4 w-4 flex-shrink-0 text-node-example" />,
      text: t('ai.chat.suggestions.explain', 'Explain this concept simply')
    },
    {
      key: 'connections',
      icon: <Link2 className="h-4 w-4 flex-shrink-0 text-edge-related-to" />,
      text: t('ai.chat.suggestions.connections', 'What connections does this concept have?')
    },
    {
      key: 'exercise',
      icon: <FileQuestion className="h-4 w-4 flex-shrink-0 text-node-question" />,
      text: t('ai.chat.suggestions.exercise', 'Generate an exercise')
    }
  ]

  const defaultMapSuggestions: Suggestion[] = [
    {
      key: 'analyze',
      icon: <Sparkles className="h-4 w-4 flex-shrink-0 text-brand" />,
      text: t('ai.chat.suggestions.analyze', 'Analyze this knowledge map')
    },
    {
      key: 'gaps',
      icon: <Lightbulb className="h-4 w-4 flex-shrink-0 text-node-example" />,
      text: t('ai.chat.suggestions.gaps', 'Find knowledge gaps')
    },
    {
      key: 'summary',
      icon: <FileQuestion className="h-4 w-4 flex-shrink-0 text-node-question" />,
      text: t('ai.chat.suggestions.summary', 'Summarize this map')
    }
  ]

  const suggestions = customSuggestions ?? (context === 'map' ? defaultMapSuggestions : defaultNodeSuggestions)
  const displayTitle = title ?? (context === 'map'
    ? t('ai.chat.emptyTitle.map', 'Ask about this map')
    : t('ai.chat.emptyTitle.node', 'Ask about this concept'))

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted/50 p-3">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Title */}
      <p className="mb-6 max-w-xs text-balance text-center text-sm text-muted-foreground">
        {displayTitle}
      </p>

      {/* Suggestions */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.key}
            type="button"
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              'flex items-center gap-3 rounded-lg border border-border px-3 py-2.5',
              'text-left text-sm text-muted-foreground',
              'hover:bg-muted/50 hover:text-foreground',
              'transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            {suggestion.icon}
            <span className="flex-1">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
