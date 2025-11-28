'use client'

import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import './docs-code-block.styles.css'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'

interface DocsCodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}

export function DocsCodeBlock({
  code,
  language = 'tsx',
  filename,
  showLineNumbers = false,
  collapsible = false,
  defaultCollapsed = false,
  className
}: DocsCodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(!defaultCollapsed)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const codeContent = (
    <>
      <div className="docs-code-block-header">
        {filename && <span className="font-medium text-foreground">{filename}</span>}
        <span className="docs-code-block-language">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="docs-code-block-copy"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className={cn('docs-code-block-pre', showLineNumbers && 'with-line-numbers')}>
        <code className={`language-${language} text-sm`}>{code}</code>
      </pre>
    </>
  )

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn('docs-code-block', className)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between rounded-none border-b h-auto py-2 px-4"
            >
              <span className="text-xs text-muted-foreground">
                {filename || `${language} code`}
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className={cn('docs-code-block-pre', showLineNumbers && 'with-line-numbers')}>
              <code className={`language-${language} text-sm`}>{code}</code>
            </pre>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return <div className={cn('docs-code-block', className)}>{codeContent}</div>
}
