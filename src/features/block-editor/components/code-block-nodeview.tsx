import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'
import { useCopyToClipboard } from '@/shared/lib/use-copy-to-clipboard'

/**
 * Language keys for the selector (labels are fetched from i18n)
 */
const LANGUAGE_KEYS = [
  'plaintext',
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'scala',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'xml',
  'markdown',
  'sql',
  'graphql',
  'bash',
  'powershell',
  'dockerfile',
  'latex'
] as const

export const CodeBlockNodeView = ({ node, updateAttributes, extension: _extension }: NodeViewProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { copied, copy } = useCopyToClipboard()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Build languages array with translated labels
  const languages = useMemo(
    () =>
      LANGUAGE_KEYS.map(key => ({
        value: key,
        label: t(`languages.${key}`)
      })),
    [t]
  )

  const currentLanguage = node.attrs.language || 'plaintext'
  const currentLabel = languages.find(l => l.value === currentLanguage)?.label || currentLanguage

  const filteredLanguages = languages.filter(
    lang =>
      lang.label.toLowerCase().includes(search.toLowerCase()) ||
      lang.value.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = useCallback(
    (language: string) => {
      updateAttributes({ language })
      setIsOpen(false)
      setSearch('')
    },
    [updateAttributes]
  )

  const handleCopy = useCallback(() => {
    copy(node.textContent)
  }, [node.textContent, copy])

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredLanguages.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredLanguages[selectedIndex]) {
            handleSelect(filteredLanguages[selectedIndex].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setSearch('')
          break
      }
    },
    [isOpen, filteredLanguages, selectedIndex, handleSelect]
  )

  return (
    <NodeViewWrapper className='relative my-2'>
      {/* Header with language selector and copy button */}
      <div className='flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/70 px-3 py-1.5'>
        {/* Language selector */}
        <div ref={dropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            className='flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
            aria-haspopup='listbox'
            aria-expanded={isOpen}
          >
            <span>{currentLabel}</span>
            <ChevronDown className='h-3 w-3' />
          </button>

          {isOpen && (
            <div
              className='absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg animate-menu-in'
              role='listbox'
            >
              <div className='p-2'>
                <input
                  ref={inputRef}
                  type='text'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('editor.codeBlock.searchLanguage')}
                  className='w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary'
                />
              </div>
              <div className='max-h-48 overflow-y-auto p-1'>
                {filteredLanguages.map((lang, index) => (
                  <button
                    key={lang.value}
                    type='button'
                    role='option'
                    aria-selected={lang.value === currentLanguage}
                    onClick={() => handleSelect(lang.value)}
                    className={cn(
                      'flex w-full items-center justify-between rounded px-2 py-1.5 text-xs transition-colors',
                      index === selectedIndex && 'bg-accent',
                      lang.value === currentLanguage && 'text-primary'
                    )}
                  >
                    <span>{lang.label}</span>
                    {lang.value === currentLanguage && <Check className='h-3 w-3' />}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <div className='px-2 py-1.5 text-xs text-muted-foreground'>
                    {t('editor.codeBlock.noResults')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Copy button with success feedback */}
        <button
          type='button'
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-xs transition-all duration-200',
            copied
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
          aria-label={t('editor.codeBlock.copy')}
        >
          {copied ? <Check className='h-3 w-3' /> : <Copy className='h-3 w-3' />}
          <span>{copied ? t('editor.codeBlock.copied') : t('editor.codeBlock.copy')}</span>
        </button>
      </div>

      {/* Code content */}
      <pre className='editor-code-block rounded-t-none !mt-0'>
        <NodeViewContent as='code' />
      </pre>
    </NodeViewWrapper>
  )
}
