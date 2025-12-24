import { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  FilterFunnel01Icon,
  MinusIcon,
  PlusIcon,
  Stars01Icon
} from '@untitledui/icons-react/outline'

import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'
import { useAIPanelStore } from '@/features/ai-assist'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { Slider } from '@/shared/components/slider'
import { cn } from '@/shared/lib/cn'

import type { ConnectionStats } from '../model/graph.data.hooks'
import {
  ALL_EDGE_TYPES,
  ALL_NODE_TYPES,
  type ConnectionPreset,
  useFilters,
  useFocusMode,
  useViewMode,
  type ViewMode
} from '../model/graph.store'
import {
  EDGE_TYPE_LABELS,
  NODE_TYPE_LABELS,
  VIEW_MODE_CONFIG
} from '../model/graph-toolbar.constants'

const CONNECTION_PRESET_ORDER: ConnectionPreset[] = ['leaves', 'medium', 'hubs']

interface GraphToolbarProps {
  nodeCountsByType?: Record<NodeType, number>
  edgeCountsByType?: Record<RelationType, number>
  connectionStats?: ConnectionStats
  selectedNodeId?: string | null
  /** Hide AI button for read-only maps */
  canEdit?: boolean
  className?: string
}

export const GraphToolbar = memo(
  ({
    nodeCountsByType,
    edgeCountsByType,
    connectionStats,
    selectedNodeId,
    canEdit = true,
    className
  }: GraphToolbarProps) => {
    const { t } = useTranslation()
    const { viewMode, setViewMode } = useViewMode()
    const { focusedNodeId, focusDepth, setFocusDepth, clearFocus, focusNode } = useFocusMode()
    const { isOpen: isAIPanelOpen, toggle: toggleAIPanel } = useAIPanelStore()
    const {
      visibleNodeTypes,
      visibleEdgeTypes,
      connectionRange,
      toggleNodeType,
      toggleEdgeType,
      setConnectionRange,
      setConnectionPreset,
      getActiveFiltersCount,
      getActiveConnectionPreset
    } = useFilters()

    const activeFiltersCount = getActiveFiltersCount()
    const activePreset = getActiveConnectionPreset()

    // Connection filter slider state
    const sliderMax = Math.max(connectionStats?.max || 0, 1)
    const [localRange, setLocalRange] = useState<[number, number]>([0, sliderMax])
    const [initialized, setInitialized] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

    // Initialize slider when graph data loads
    useEffect(() => {
      if (!initialized && connectionStats?.max > 0) {
        setLocalRange([0, connectionStats.max])
        setConnectionRange([0, Infinity])
        setInitialized(true)
      }
    }, [initialized, connectionStats?.max, setConnectionRange])

    // Sync slider with store (for preset buttons)
    useEffect(() => {
      if (!initialized) {
        return
      }
      setLocalRange([
        connectionRange[0],
        connectionRange[1] === Infinity ? sliderMax : connectionRange[1]
      ])
    }, [initialized, connectionRange, sliderMax])

    // Cleanup debounce timer
    useEffect(
      () => () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      },
      []
    )

    const handleSliderChange = (value: number[]) => {
      setLocalRange([value[0], value[1]])
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        setConnectionRange([value[0], value[1] >= sliderMax ? Infinity : value[1]])
      }, 150)
    }

    return (
      <div
        className={cn(
          'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
          'pointer-events-none',
          className
        )}
      >
        <Card className='flex items-center gap-1.5 px-1.5 py-1 border border-border/60 pointer-events-auto rounded-xl'>
          {/* AI Button - only show for owners */}
          {canEdit && (
            <>
              <Button
                size='sm'
                variant={isAIPanelOpen ? 'secondary' : 'ghost'}
                onClick={toggleAIPanel}
                className='h-7 px-2.5'
                title={t('graph.toolbar.aiAnalysis')}
              >
                <Stars01Icon className='w-4 h-4 sm:mr-1' />
                <span className='hidden sm:inline'>AI</span>
              </Button>

              <div className='h-5 w-px bg-border/60' />
            </>
          )}

          {/* View Mode Selector */}
          <div className='flex items-center gap-0.5 bg-muted/60 rounded-lg p-1'>
            {(Object.keys(VIEW_MODE_CONFIG) as ViewMode[]).map(mode => {
              const config = VIEW_MODE_CONFIG[mode]
              const Icon = config.icon
              const isActive = viewMode === mode

              const handleClick = () => {
                // If clicking Focus and there's a selected node, focus on it directly
                if (mode === 'focus' && selectedNodeId) {
                  focusNode(selectedNodeId)
                } else {
                  setViewMode(mode)
                }
              }

              return (
                <Button
                  key={mode}
                  size='sm'
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={handleClick}
                  className='h-7 px-2.5 gap-1'
                  title={t(config.labelKey)}
                >
                  <Icon className='w-3.5 h-3.5' />
                  <span className='hidden md:inline text-xs'>{t(config.labelKey)}</span>
                </Button>
              )
            })}
          </div>

          {/* Focus Depth Control - only visible in focus mode with focused node */}
          {viewMode === 'focus' && focusedNodeId && (
            <>
              <div className='h-5 w-px bg-border/60' />
              <div className='flex items-center gap-2 px-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setFocusDepth(focusDepth - 1)}
                  disabled={focusDepth <= 1}
                  className='h-6 w-6 p-0'
                >
                  <MinusIcon className='w-3 h-3' />
                </Button>
                <span className='text-xs font-medium min-w-[4rem] text-center'>
                  {t('graph.toolbar.depth')}: {focusDepth}
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setFocusDepth(focusDepth + 1)}
                  disabled={focusDepth >= 5}
                  className='h-6 w-6 p-0'
                >
                  <PlusIcon className='w-3 h-3' />
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={clearFocus}
                  className='h-6 px-2 text-xs'
                >
                  {t('graph.toolbar.clearFocus')}
                </Button>
              </div>
            </>
          )}

          {/* Focus mode hint - show when in focus mode but no node focused */}
          {viewMode === 'focus' && !focusedNodeId && (
            <>
              <div className='h-5 w-px bg-border/60' />
              <span className='text-xs text-muted-foreground px-2'>
                {t('graph.toolbar.focusHint')}
              </span>
            </>
          )}

          <div className='h-5 w-px bg-border/60' />

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='sm'
                variant={activeFiltersCount > 0 ? 'secondary' : 'ghost'}
                className='h-7 px-2.5 gap-1'
              >
                <FilterFunnel01Icon className='w-4 h-4' />
                <span className='hidden sm:inline text-xs'>{t('graph.toolbar.filters')}</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant='destructive'
                    className='h-4 px-1 text-[10px] ml-0.5 rounded-xs'
                    suppressHydrationWarning
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='center' className='w-56'>
              <DropdownMenuLabel>{t('graph.filters.nodeTypes')}</DropdownMenuLabel>
              {ALL_NODE_TYPES.map(type => {
                const count = nodeCountsByType?.[type] ?? 0
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={visibleNodeTypes.has(type)}
                    onCheckedChange={() => toggleNodeType(type)}
                    onSelect={e => e.preventDefault()}
                    disabled={count === 0}
                  >
                    <span className='flex-1'>{t(NODE_TYPE_LABELS[type])}</span>
                    {count > 0 && (
                      <Badge variant='secondary' className='ml-2 h-5 px-1.5 text-[10px] rounded-xs'>
                        {count}
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                )
              })}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>{t('graph.filters.edgeTypes')}</DropdownMenuLabel>
              {ALL_EDGE_TYPES.map(type => {
                const count = edgeCountsByType?.[type] ?? 0
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={visibleEdgeTypes.has(type)}
                    onCheckedChange={() => toggleEdgeType(type)}
                    onSelect={e => e.preventDefault()}
                    disabled={count === 0}
                  >
                    <span className='flex-1'>{t(EDGE_TYPE_LABELS[type])}</span>
                    {count > 0 && (
                      <Badge variant='secondary' className='ml-2 h-5 px-1.5 text-[10px] rounded-xs'>
                        {count}
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                )
              })}

              <DropdownMenuSeparator />

              {/* Connection count filter */}
              <DropdownMenuLabel>{t('graph.filters.connections')}</DropdownMenuLabel>

              {/* Presets */}
              <div className='flex gap-1 px-2 py-1.5'>
                {CONNECTION_PRESET_ORDER.map(preset => (
                  <Button
                    key={preset}
                    size='sm'
                    variant={activePreset === preset ? 'secondary' : 'ghost'}
                    className='h-6 px-2 text-xs flex-1'
                    onClick={() => setConnectionPreset(preset)}
                  >
                    {t(`graph.filters.preset.${preset}`)}
                  </Button>
                ))}
              </div>

              {/* Range slider */}
              <div className='px-2 py-2'>
                <div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
                  <span>{String(localRange[0])}</span>
                  <span>
                    {localRange[1] >= sliderMax ? `${sliderMax}+` : String(localRange[1])}
                  </span>
                </div>
                <Slider
                  value={localRange}
                  min={0}
                  max={sliderMax}
                  step={1}
                  onValueChange={handleSliderChange}
                />
              </div>

              {/* Reset to all */}
              {activePreset !== 'all' && (
                <div className='px-2 pb-1'>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-6 px-2 text-xs w-full text-muted-foreground'
                    onClick={() => setConnectionPreset('all')}
                  >
                    {t('graph.filters.resetConnections')}
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </div>
    )
  }
)

GraphToolbar.displayName = 'GraphToolbar'
