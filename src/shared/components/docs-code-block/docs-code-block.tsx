'use client'

import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Copy01Icon } from '@untitledui/icons-react/outline'
import * as React from 'react'
import { Button } from '@/shared/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { cn } from '@/shared/lib/cn'
import styles from './docs-code-block.module.css'

interface DocsCodeBlockProps {
  code: string
  language?: string
  filename?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  embedded?: boolean
  className?: string
}

const COPY_FEEDBACK_DURATION_MS = 2000

export const DocsCodeBlock = ({
  code,
  language = 'tsx',
  filename,
  collapsible = false,
  defaultCollapsed = false,
  embedded = false,
  className
}: DocsCodeBlockProps) => {
  const [copied, setCopied] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(!defaultCollapsed)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS)
    } catch {
      // Clipboard API failed - user denied permission or unsupported
    }
  }

  const codeContent = (
    <>
      <div className={styles.header}>
        {filename && <span className='font-medium text-foreground'>{filename}</span>}
        <span className={styles.language}>{language}</span>
        <button
          type='button'
          onClick={handleCopy}
          className={styles.copy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <CheckIcon className='h-4 w-4 text-success' /> : <Copy01Icon className='h-4 w-4' />}
        </button>
      </div>
      <pre className={styles.pre}>
        <code className={`language-${language} text-sm`}>{code}</code>
      </pre>
    </>
  )

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn(styles.block, embedded && styles.embedded, className)}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-between rounded-none border-b h-auto py-2 px-4'
            >
              <span className='text-xs text-muted-foreground'>
                {filename || `${language} code`}
              </span>
              {isOpen ? <ChevronUpIcon className='h-4 w-4' /> : <ChevronDownIcon className='h-4 w-4' />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className={styles.pre}>
              <code className={`language-${language} text-sm`}>{code}</code>
            </pre>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div className={cn(styles.block, embedded && styles.embedded, className)}>{codeContent}</div>
  )
}
