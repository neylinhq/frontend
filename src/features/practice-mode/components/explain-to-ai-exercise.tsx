'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { cn } from '@/shared/lib/cn'

/**
 * ExplainToAIExercise implements the protégé effect (Chase et al. 2009):
 * The user explains a concept to an AI "student" who asks clarifying questions.
 *
 * Flow:
 * 1. AI asks: "Can you explain [concept] to me?"
 * 2. User writes explanation
 * 3. (Future: AI asks follow-up) → for now, single-turn with rich prompt
 * 4. Submit the explanation for AI evaluation
 */

interface ExplainToAIExerciseProps {
  question: string
  onSubmit: (explanation: string) => void
  disabled?: boolean
}

interface Message {
  role: 'ai' | 'user'
  content: string
}

export function ExplainToAIExercise({ question, onSubmit, disabled }: ExplainToAIExerciseProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: question },
  ])
  const [input, setInput] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || disabled || hasSubmitted) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setHasSubmitted(true)

    // Submit the user's explanation for AI evaluation
    onSubmit(text)
  }, [input, disabled, hasSubmitted, onSubmit])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && input.trim()) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Chat messages */}
      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              msg.role === 'ai'
                ? 'bg-muted/50 self-start max-w-[85%]'
                : 'bg-primary/10 self-end max-w-[85%]'
            )}
          >
            {msg.role === 'ai' && (
              <span className="text-xs font-medium text-muted-foreground block mb-0.5">
                AI {t('practice.mode.student', 'Student')}
              </span>
            )}
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Input area */}
      {!hasSubmitted && (
        <div className="flex flex-col gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('practice.mode.explainConcept', 'Explain this concept in your own words...')}
            className="min-h-[80px] text-sm"
            disabled={disabled}
            autoFocus
          />
          <Button onClick={handleSend} disabled={!input.trim() || disabled}>
            {t('practice.mode.submitExplanation', 'Submit Explanation')}
          </Button>
        </div>
      )}
    </div>
  )
}
