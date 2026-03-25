'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { cn } from '@/shared/lib/cn'

import type { LessonPlan } from '../api/practice-mode.api'
import { learnSessionApi } from '../api/practice-mode.api'
import { usePracticeModeActions } from '../model/practice-mode.store'

// --- Types ---

interface ChatMessage {
  id: string
  role: 'user' | 'tutor'
  content: string
  cardType?: 'exercise' | 'explanation' | 'feedback-correct' | 'feedback-incorrect'
}

// --- Component ---

interface LearnChatProps {
  mapId: string
  nodeId: string
  nodeLabel: string
  className?: string
}

export function LearnChat({ mapId, nodeId, nodeLabel, className }: LearnChatProps) {
  const { t } = useTranslation()
  const { recordAnswer, setView } = usePracticeModeActions()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [lesson, setLesson] = useState<LessonPlan | null>(null)
  const [currentStep, setCurrentStep] = useState('activation')
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate lesson plan on mount
  useEffect(() => {
    let cancelled = false

    learnSessionApi.startLesson(mapId, nodeId).then((plan) => {
      if (cancelled) {
        return
      }
      setLesson(plan)
      setIsLoading(false)

      // Add first tutor message from the activation step
      const activationStep = plan.steps.find((s) => s.type === 'activation')
      if (activationStep?.prompt) {
        setMessages([{
          id: 'activation-0',
          role: 'tutor',
          content: activationStep.prompt,
          cardType: 'exercise',
        }])
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message)
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [mapId, nodeId])

  const sendMessage = useCallback(async (text: string) => {
    if (!lesson || isStreaming) {
      return
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    // Add placeholder for tutor response
    const tutorMsgId = `tutor-${Date.now()}`
    const tutorMsg: ChatMessage = {
      id: tutorMsgId,
      role: 'tutor',
      content: '',
    }
    setMessages((prev) => [...prev, tutorMsg])

    const history = messages
      .filter((m) => m.content)
      .map((m) => ({
        role: (m.role === 'tutor' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content,
      }))
    history.push({ role: 'user', content: text })

    const abort = new AbortController()
    abortRef.current = abort

    let streamedContent = ''

    try {
      await learnSessionApi.chatStream(mapId, text, (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          streamedContent += chunk.content
          setMessages((prev) =>
            prev.map((m) => (m.id === tutorMsgId ? { ...m, content: streamedContent } : m))
          )
        }
      }, {
        lessonPlan: lesson,
        history,
        currentStep,
        conceptTitle: lesson.concept,
        signal: abort.signal,
      })

      // Parse step metadata from response
      const stepMatch = streamedContent.match(/<!--step:(\w+)-->/)
      if (stepMatch) {
        const newStep = stepMatch[1]
        setCurrentStep(newStep)

        // Remove metadata from displayed message
        const cleanContent = streamedContent.replace(/<!--step:\w+-->/, '').trim()
        setMessages((prev) =>
          prev.map((m) => (m.id === tutorMsgId ? { ...m, content: cleanContent } : m))
        )

        // If lesson complete, record in FSRS
        if (newStep === 'complete') {
          recordAnswer(nodeId, true, {
            nodeId,
            nodeLabel,
            before: 0,
            after: 1,
            delta: 1,
          })
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tutorMsgId
            ? { ...m, content: streamedContent || t('practice.noExercises') }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [lesson, isStreaming, messages, currentStep, mapId, nodeId, nodeLabel, recordAnswer, t])

  const handleSubmit = useCallback(() => {
    const text = input.trim()
    if (text) {
      sendMessage(text)
    }
  }, [input, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNoIdea = useCallback(() => {
    sendMessage(t('practice.mode.noIdea', 'No idea'))
  }, [sendMessage, t])

  // --- Loading ---
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3 h-full', className)}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          {t('practice.mode.preparingLesson', 'Preparing lesson...')}
        </p>
      </div>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <p className="text-sm text-muted-foreground text-center py-8">{error}</p>
        <Button variant="outline" onClick={() => setView('overview')}>
          {t('practice.mode.backToOverview')}
        </Button>
      </div>
    )
  }

  // --- Complete ---
  if (currentStep === 'complete' && lesson) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} />
          ))}

          {/* Takeaway card */}
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 mt-4">
            <p className="text-xs font-medium text-primary mb-2">
              {t('practice.mode.takeaway', 'Key takeaway')}
            </p>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{lesson.takeaway}</Markdown>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('practice.mode.firstReview', 'First review: tomorrow')}
          </p>
        </div>

        <div className="p-3 border-t">
          <Button className="w-full" onClick={() => setView('overview')}>
            {t('practice.mode.done')}
          </Button>
        </div>
      </div>
    )
  }

  // --- Chat ---
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-2 border-b">
        <p className="text-sm font-medium truncate">{lesson?.concept}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageCard key={msg.id} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t space-y-2">
        {messages.length <= 1 && (
          <Button variant="ghost" size="sm" className="text-xs w-full" onClick={handleNoIdea}>
            {t('practice.mode.noIdea', 'No idea')}
          </Button>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('practice.mode.yourAnswer')}
            className="min-h-[40px] max-h-[120px] text-sm resize-none"
            disabled={isStreaming}
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 self-end"
          >
            ↑
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Message Card ---

function MessageCard({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-br-sm bg-primary/10 px-3 py-2 max-w-[85%]">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[95%]">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <Markdown>{message.content}</Markdown>
      </div>
    </div>
  )
}
