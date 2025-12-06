'use client'

import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
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
      setTimeout(() => setCopied(false), 2000)
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
          {copied ? <Check className='h-4 w-4 text-success' /> : <Copy className='h-4 w-4' />}
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
              {isOpen ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
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
