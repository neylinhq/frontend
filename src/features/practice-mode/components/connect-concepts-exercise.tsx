'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { cn } from '@/shared/lib/cn'

/**
 * ConnectConceptsExercise asks the user to identify and explain the relationship
 * between two concepts. On correct answer, a real edge is created in the knowledge graph.
 *
 * Expected question format: "What is the relationship between [A] and [B]?"
 * Expected metadata: { sourceNode, targetNode, conceptA, conceptB }
 */

const RELATION_TYPES = [
  'prerequisite',
  'explains',
  'similar-to',
  'contradicts',
  'part-of',
  'causes',
  'is-a',
] as const

interface ConnectConceptsExerciseProps {
  question: string
  conceptA?: string
  conceptB?: string
  onSubmit: (answer: { relationType: string; explanation: string }) => void
  disabled?: boolean
}

export function ConnectConceptsExercise({
  question,
  conceptA,
  conceptB,
  onSubmit,
  disabled,
}: ConnectConceptsExerciseProps) {
  const { t } = useTranslation()
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null)
  const [explanation, setExplanation] = useState('')

  const canSubmit = selectedRelation && explanation.trim().length > 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      e.preventDefault()
      onSubmit({ relationType: selectedRelation!, explanation: explanation.trim() })
    }
  }

  return (
    <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
      <p className="text-sm leading-relaxed">{question}</p>

      {/* Concept pair visualization */}
      {conceptA && conceptB && (
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="rounded-lg border bg-card px-3 py-2 text-sm font-medium">
            {conceptA}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-lg">→</span>
            {selectedRelation && (
              <span className="text-xs text-primary font-medium">{selectedRelation}</span>
            )}
          </div>
          <div className="rounded-lg border bg-card px-3 py-2 text-sm font-medium">
            {conceptB}
          </div>
        </div>
      )}

      {/* Relation type selection */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t('practice.mode.selectRelation', 'Select the relationship type:')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {RELATION_TYPES.map((rel) => (
            <button
              key={rel}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedRelation(rel)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                'hover:border-primary/50',
                selectedRelation === rel
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground',
                disabled && 'pointer-events-none opacity-60'
              )}
            >
              {rel}
            </button>
          ))}
        </div>
      </div>

      {/* Self-explanation: why does this connection exist? */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t('practice.selfExplanation.whyThisConnection')}
        </p>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={t('practice.mode.explainConnection', 'Why does this relationship exist?')}
          className="min-h-[80px] text-sm"
          disabled={disabled}
        />
      </div>

      <Button
        onClick={() => onSubmit({ relationType: selectedRelation!, explanation: explanation.trim() })}
        disabled={!canSubmit || disabled}
        className="mt-1"
      >
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}
