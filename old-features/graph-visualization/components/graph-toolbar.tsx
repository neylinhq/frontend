import {
  Focus,
  Sparkles,
  Network,
  Route,
  Filter,
  Minus,
  Plus,
} from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import {
  useViewMode,
  useFocusMode,
  useFilters,
  ALL_NODE_TYPES,
  ALL_EDGE_TYPES,
  type ViewMode,
} from '@/features/graph-view'
import type { NodeType } from '@/entities/node'
import type { RelationType } from '@/entities/edge'

interface GraphToolbarProps {
  mapId: string
  nodeCountsByType?: Record<NodeType, number>
  edgeCountsByType?: Record<RelationType, number>
  className?: string
}

// View mode icons and labels
const VIEW_MODE_CONFIG: Record<ViewMode, { icon: typeof Network; labelKey: string }> = {
  overview: { icon: Network, labelKey: 'graph.viewModes.overview' },
  focus: { icon: Focus, labelKey: 'graph.viewModes.focus' },
  path: { icon: Route, labelKey: 'graph.viewModes.path' },
}

// Node type display names
const NODE_TYPE_LABELS: Record<NodeType, string> = {
  concept: 'graph.nodeTypes.concept',
  fact: 'graph.nodeTypes.fact',
  theory: 'graph.nodeTypes.theory',
  example: 'graph.nodeTypes.example',
  question: 'graph.nodeTypes.question',
  hypothesis: 'graph.nodeTypes.hypothesis',
  person: 'graph.nodeTypes.person',
  school: 'graph.nodeTypes.school',
}

// Edge type display names - use same keys as knowledge-edge.tsx
const EDGE_TYPE_LABELS: Record<RelationType, string> = {
  'is-a': 'graph.edgeTypes.is-a',
  'has-a': 'graph.edgeTypes.has-a',
  'causes': 'graph.edgeTypes.causes',
  'explains': 'graph.edgeTypes.explains',
  'related-to': 'graph.edgeTypes.related-to',
  'influences': 'graph.edgeTypes.influences',
  'part-of': 'graph.edgeTypes.part-of',
  'prerequisite': 'graph.edgeTypes.prerequisite',
  'contradicts': 'graph.edgeTypes.contradicts',
  'similar-to': 'graph.edgeTypes.similar-to',
}

export const GraphToolbar = memo(
  ({
    mapId,
    nodeCountsByType,
    edgeCountsByType,
    className,
  }: GraphToolbarProps) => {
    const { t } = useTranslation()
    const { viewMode, setViewMode } = useViewMode()
    const { focusedNodeId, focusDepth, setFocusDepth, clearFocus } = useFocusMode()
    const {
      visibleNodeTypes,
      visibleEdgeTypes,
      toggleNodeType,
      toggleEdgeType,
      getActiveFiltersCount,
    } = useFilters()

    const activeFiltersCount = getActiveFiltersCount()

    return (
      <div
        className={cn(
          'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
          'pointer-events-none',
          className
        )}
      >
        <Card className="flex items-center gap-1 p-1.5 shadow-xl border-2 pointer-events-auto">
          {/* AI Button */}
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-8 px-3 hidden sm:flex"
            title={t('graph.toolbar.aiAnalysis')}
          >
            <Link to={`/dashboard/maps/${mapId}/ai`}>
              <Sparkles className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">AI</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* View Mode Selector */}
          <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
            {(Object.keys(VIEW_MODE_CONFIG) as ViewMode[]).map((mode) => {
              const config = VIEW_MODE_CONFIG[mode]
              const Icon = config.icon
              const isActive = viewMode === mode

              return (
                <Button
                  key={mode}
                  size="sm"
                  variant={isActive ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'h-7 px-2.5 gap-1.5',
                    isActive && 'shadow-sm'
                  )}
                  title={t(config.labelKey)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-xs">{t(config.labelKey)}</span>
                </Button>
              )
            })}
          </div>

          {/* Focus Depth Control - only visible in focus mode with focused node */}
          {viewMode === 'focus' && focusedNodeId && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 px-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFocusDepth(focusDepth - 1)}
                  disabled={focusDepth <= 1}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium min-w-[4rem] text-center">
                  {t('graph.toolbar.depth')}: {focusDepth}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFocusDepth(focusDepth + 1)}
                  disabled={focusDepth >= 5}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFocus}
                  className="h-6 px-2 text-xs"
                >
                  {t('graph.toolbar.clearFocus')}
                </Button>
              </div>
            </>
          )}

          {/* Focus mode hint - show when in focus mode but no node focused */}
          {viewMode === 'focus' && !focusedNodeId && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground px-2">
                {t('graph.toolbar.focusHint')}
              </span>
            </>
          )}

          <div className="h-4 w-px bg-border" />

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant={activeFiltersCount > 0 ? 'secondary' : 'ghost'}
                className="h-8 px-2.5 gap-1.5"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{t('graph.toolbar.filters')}</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="h-4 px-1 text-[10px] ml-0.5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuLabel>{t('graph.filters.nodeTypes')}</DropdownMenuLabel>
              {ALL_NODE_TYPES.map((type) => {
                const count = nodeCountsByType?.[type] ?? 0
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={visibleNodeTypes.has(type)}
                    onCheckedChange={() => toggleNodeType(type)}
                    onSelect={(e) => e.preventDefault()}
                    disabled={count === 0}
                  >
                    <span className="flex-1">{t(NODE_TYPE_LABELS[type])}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                        {count}
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                )
              })}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>{t('graph.filters.edgeTypes')}</DropdownMenuLabel>
              {ALL_EDGE_TYPES.map((type) => {
                const count = edgeCountsByType?.[type] ?? 0
                return (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={visibleEdgeTypes.has(type)}
                    onCheckedChange={() => toggleEdgeType(type)}
                    onSelect={(e) => e.preventDefault()}
                    disabled={count === 0}
                  >
                    <span className="flex-1">{t(EDGE_TYPE_LABELS[type])}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                        {count}
                      </Badge>
                    )}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </div>
    )
  }
)

GraphToolbar.displayName = 'GraphToolbar'
