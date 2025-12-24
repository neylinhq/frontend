import { Link01Icon, PlusIcon, XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { type RelationType, RelationTypeEnum } from '@/entities/edge'
import { useFullMap } from '@/entities/map'
import { getNodeIcon } from '@/entities/node'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'
import { cn } from '@/shared/lib/cn'
import { type PendingConnection, useNodeCreationStore } from '../model/node-creation.store'

const ALL_RELATION_TYPES = RelationTypeEnum.options

export const ConnectionSelector = memo(() => {
  const { t } = useTranslation()
  const { mapId } = useParams<{ mapId: string }>()
  const { data: fullMap } = useFullMap(mapId || '')

  const { pendingConnections, addConnection, removeConnection, updateConnectionType } =
    useNodeCreationStore()

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter available nodes (exclude already selected)
  const availableNodes = useMemo(() => {
    if (!fullMap?.nodes) {
      return []
    }
    const selectedIds = new Set(pendingConnections.map(c => c.targetNodeId))
    return fullMap.nodes
      .filter(node => !selectedIds.has(node.id))
      .filter(
        node => searchQuery === '' || node.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 8)
  }, [fullMap?.nodes, pendingConnections, searchQuery])

  const handleSelectNode = (nodeId: string, nodeLabel: string) => {
    addConnection({
      targetNodeId: nodeId,
      targetNodeLabel: nodeLabel,
      relationType: 'related-to',
      direction: 'outgoing'
    })
    setIsOpen(false)
    setSearchQuery('')
  }

  if (!fullMap?.nodes?.length) {
    return null
  }

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='flex items-center gap-1.5 text-sm font-medium text-muted-foreground'>
          <Link01Icon className='h-3.5 w-3.5' />
          {t('nodeCreation.connections.label', 'Connect to')}
        </span>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='sm' className='h-7 px-2'>
              <PlusIcon className='mr-1 h-3.5 w-3.5' />
              {t('nodeCreation.connections.add', 'Add')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[280px] p-0' align='end'>
            <div className='p-2'>
              <Input
                placeholder={t('nodeCreation.connections.searchPlaceholder', 'Search nodes...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='mb-2 h-8 text-xs'
                autoFocus
              />
              <div className='max-h-[200px] overflow-y-auto'>
                {availableNodes.length === 0 ? (
                  <div className='py-4 text-center text-xs text-muted-foreground'>
                    {t('nodeCreation.connections.noResults', 'No nodes found')}
                  </div>
                ) : (
                  availableNodes.map(node => {
                    const Icon = getNodeIcon(node.type)
                    return (
                      <button
                        key={node.id}
                        type='button'
                        onClick={() => handleSelectNode(node.id, node.label)}
                        className={cn(
                          'group flex w-full items-center gap-2 rounded-xs px-2 py-1 text-left text-xs',
                          'cursor-pointer transition-colors',
                          'hover:bg-[var(--surface-hover)] hover:text-foreground',
                          'focus:bg-[var(--surface-hover)] focus:text-foreground focus:outline-none'
                        )}
                      >
                        <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span className='flex-1 truncate'>{node.label}</span>
                        <PlusIcon className='h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected connections */}
      {pendingConnections.length > 0 && (
        <div className='space-y-2'>
          {pendingConnections.map(connection => (
            <ConnectionRow
              key={connection.targetNodeId}
              connection={connection}
              onRemove={() => removeConnection(connection.targetNodeId)}
              onTypeChange={type => updateConnectionType(connection.targetNodeId, type)}
            />
          ))}
        </div>
      )}
    </div>
  )
})

ConnectionSelector.displayName = 'ConnectionSelector'

interface ConnectionRowProps {
  connection: PendingConnection
  onRemove: () => void
  onTypeChange: (type: RelationType) => void
}

const ConnectionRow = memo(({ connection, onRemove, onTypeChange }: ConnectionRowProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex items-center gap-2 rounded-md border bg-muted/30 p-2'>
      <span className='flex-1 truncate text-sm'>{connection.targetNodeLabel}</span>

      <Select value={connection.relationType} onValueChange={onTypeChange}>
        <SelectTrigger className='h-7 w-[130px] text-xs'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ALL_RELATION_TYPES.map(type => (
            <SelectItem key={type} value={type} className='text-xs'>
              {t(`graph.edgeTypes.${type}`, type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant='ghost' size='sm' className='h-7 w-7 p-0' onClick={onRemove}>
        <XCloseIcon className='h-3.5 w-3.5' />
      </Button>
    </div>
  )
})

ConnectionRow.displayName = 'ConnectionRow'
