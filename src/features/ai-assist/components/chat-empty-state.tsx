import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'

interface Suggestion {
  key: string
  text: string
}

interface ChatEmptyStateProps {
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
 * - Subtle pill tags with hint text below
 * - "Interface disappears, content shines"
 */
export const ChatEmptyState = ({
  onSuggestionClick,
  suggestions: customSuggestions,
  context = 'node'
}: ChatEmptyStateProps) => {
  const { t } = useTranslation()

  const defaultNodeSuggestions: Suggestion[] = [
    { key: 'explain', text: t('ai.chat.suggestions.explain', 'Explain simply') },
    { key: 'connections', text: t('ai.chat.suggestions.connections', 'Show connections') },
    { key: 'exercise', text: t('ai.chat.suggestions.exercise', 'Create exercise') }
  ]

  const defaultMapSuggestions: Suggestion[] = [
    { key: 'analyze', text: t('ai.chat.suggestions.analyze', 'Analyze map') },
    { key: 'gaps', text: t('ai.chat.suggestions.gaps', 'Find gaps') },
    { key: 'summary', text: t('ai.chat.suggestions.summary', 'Summarize') }
  ]

  const suggestions = customSuggestions ?? (context === 'map' ? defaultMapSuggestions : defaultNodeSuggestions)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4">
      {/* Tags - hidden on mobile */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-2">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.key}
            type="button"
            onClick={() => onSuggestionClick(suggestion.text)}
            className={cn(
              'px-3 py-1.5 rounded-full cursor-pointer',
              'text-xs text-muted-foreground',
              'border border-border/60',
              'hover:border-border hover:text-foreground hover:bg-muted/30',
              'transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
          >
            {suggestion.text}
          </button>
        ))}
      </div>

      {/* Hint text */}
      <p className="text-base text-center text-balance text-muted-foreground/60">
        {t('ai.chat.emptyHint', 'Type anything or use /commands')}
      </p>
    </div>
  )
}
