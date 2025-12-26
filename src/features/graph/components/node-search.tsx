'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowRightIcon, SearchMdIcon } from '@untitledui/icons-react/outline'

import type { LightweightNode } from '@/entities/node'
import { getNodeIcon } from '@/entities/node/lib/node-icon'
import { Button } from '@/shared/components/button'
import { CommandPalette, type CommandPaletteItem } from '@/shared/components/command-palette'
import { cn } from '@/shared/lib/cn'
import { isMac } from '@/shared/lib/platform'

interface NodeSearchItem extends CommandPaletteItem {
  node: LightweightNode
}

// Filter function for node search
const filterNodeItem = (item: NodeSearchItem, query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim()
  const terms = normalizedQuery.split(/\s+/)

  const searchableText = [item.node.label, item.node.description, item.node.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return terms.every(term => searchableText.includes(term))
}

// Node type labels for grouping (matching graph.toolbar.constants.ts)
const NODE_TYPE_LABELS: Record<string, string> = {
  concept: 'graph.nodeTypes.concept',
  fact: 'graph.nodeTypes.fact',
  theory: 'graph.nodeTypes.theory',
  example: 'graph.nodeTypes.example',
  question: 'graph.nodeTypes.question',
  hypothesis: 'graph.nodeTypes.hypothesis',
  person: 'graph.nodeTypes.person',
  school: 'graph.nodeTypes.school'
}

// Render function for node items
const NodeSearchItemRenderer = ({
  item,
  isSelected,
  t
}: {
  item: NodeSearchItem
  isSelected: boolean
  t: (key: string) => string
}) => {
  const Icon = getNodeIcon(item.node.type)

  return (
    <div className='flex items-center gap-3 px-3 py-2.5 text-left'>
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border',
          isSelected ? 'border-accent-foreground/20 bg-background' : 'border-border bg-muted/50'
        )}
      >
        <Icon className='h-4 w-4' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='font-medium text-sm truncate'>{item.node.label}</div>
        {item.node.description && (
          <div className='text-xs text-muted-foreground truncate'>{item.node.description}</div>
        )}
      </div>
      {isSelected && <ArrowRightIcon className='h-4 w-4 text-muted-foreground shrink-0' />}
    </div>
  )
}

interface NodeSearchProps {
  nodes: LightweightNode[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect: (node: LightweightNode) => void
}

export const NodeSearch = ({ nodes, open, onOpenChange, onSelect }: NodeSearchProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const controlled = open !== undefined
  const isDialogOpen = controlled ? open : isOpen
  const setDialogOpen = controlled && onOpenChange ? onOpenChange : setIsOpen

  // Transform nodes to search items
  const searchItems: NodeSearchItem[] = nodes.map(node => ({
    id: node.id,
    node
  }))

  const handleSelect = (item: NodeSearchItem) => {
    onSelect(item.node)
  }

  return (
    <CommandPalette
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
      items={searchItems}
      filterFn={filterNodeItem}
      groupBy={item => t(NODE_TYPE_LABELS[item.node.type] || item.node.type)}
      renderItem={(item, isSelected) => (
        <NodeSearchItemRenderer item={item} isSelected={isSelected} t={t} />
      )}
      onSelect={handleSelect}
      placeholder={t('graph.search.placeholder')}
      emptyMessage={t('graph.search.empty')}
      title={t('graph.search.title')}
    />
  )
}

// Trigger component for search button
interface NodeSearchTriggerProps {
  nodes: LightweightNode[]
  onSelect: (node: LightweightNode) => void
  className?: string
  variant?: 'default' | 'toolbar'
}

export const NodeSearchTrigger = ({
  nodes,
  onSelect,
  className,
  variant = 'default'
}: NodeSearchTriggerProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  if (variant === 'toolbar') {
    return (
      <>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setOpen(true)}
          className={cn('h-8 px-2.5 gap-1.5', className)}
          title={t('graph.search.title')}
        >
          <SearchMdIcon className='w-4 h-4' />
          <span className='hidden sm:inline text-xs'>{t('graph.search.button')}</span>
          <kbd className='hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium'>
            {isMac ? '⌘' : 'Ctrl+'}K
          </kbd>
        </Button>
        <NodeSearch nodes={nodes} open={open} onOpenChange={setOpen} onSelect={onSelect} />
      </>
    )
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className
        )}
      >
        <SearchMdIcon className='h-4 w-4' />
        <span>{t('graph.search.button')}</span>
        <kbd className='hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium'>
          {isMac ? '⌘' : 'Ctrl+'}K
        </kbd>
      </button>
      <NodeSearch nodes={nodes} open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  )
}
