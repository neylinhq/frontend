import { Focus, ArrowLeft, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { Switch } from '@/shared/ui/switch'
import { Separator } from '@/shared/ui/separator'
import { useGraphViewStore } from '../store/graph-view-store'
import type { RelationType } from '@/entities/edge'

interface NodeViewControlsProps {
  nodeId: string
}

const edgeTypes: RelationType[] = [
  'is-a',
  'has-a',
  'causes',
  'explains',
  'related-to',
  'influences',
  'part-of',
  'prerequisite',
  'contradicts',
  'similar-to'
]

export function NodeViewControls({ nodeId }: NodeViewControlsProps) {
  const { t } = useTranslation()
  const {
    filters,
    setFocusMode,
    toggleEdgeType,
    setEdgeDirection
  } = useGraphViewStore()

  const isFocused = filters.focusNodeId === nodeId
  const depth = filters.focusDepth ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">{t('graph.nodeControls.title')}</h3>

        {/* Focus Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('graph.nodeControls.focusMode')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('graph.nodeControls.focusModeDescription')}
              </p>
            </div>
            <Button
              size="sm"
              variant={isFocused ? 'default' : 'outline'}
              onClick={() => {
                if (isFocused) {
                  setFocusMode(null)
                } else {
                  setFocusMode(nodeId, depth)
                }
              }}
              className="gap-2"
            >
              <Focus className="h-4 w-4" />
              {isFocused ? t('common.disable') : t('common.enable')}
            </Button>
          </div>

          {/* Depth Slider */}
          {isFocused && (
            <div className="space-y-2 pl-4 border-l-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('graph.nodeControls.connectionDepth')}</Label>
                <span className="text-xs text-muted-foreground">{depth} {t('graph.nodeControls.hops')}</span>
              </div>
              <Slider
                value={[depth]}
                onValueChange={([value]) => setFocusMode(nodeId, value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Edge Direction */}
        {isFocused && (
          <>
            <div className="space-y-3">
              <Label className="text-sm">{t('graph.nodeControls.edgeDirection')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={filters.edgeDirection === 'incoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEdgeDirection('incoming')}
                  className="gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="text-xs">{t('graph.nodeControls.incoming')}</span>
                </Button>
                <Button
                  variant={filters.edgeDirection === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEdgeDirection('all')}
                  className="gap-1"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  <span className="text-xs">{t('graph.nodeControls.all')}</span>
                </Button>
                <Button
                  variant={filters.edgeDirection === 'outgoing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEdgeDirection('outgoing')}
                  className="gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span className="text-xs">{t('graph.nodeControls.outgoing')}</span>
                </Button>
              </div>
            </div>

            <Separator className="my-4" />
          </>
        )}

        {/* Edge Type Filters */}
        <div className="space-y-3">
          <Label className="text-sm">{t('graph.nodeControls.edgeTypes')}</Label>
          <div className="space-y-2">
            {edgeTypes.map((type) => (
              <div key={type} className="flex items-center justify-between">
                <Label htmlFor={`edge-${type}`} className="text-xs font-normal cursor-pointer">
                  {t(`graph.edgeTypes.${type}`)}
                </Label>
                <Switch
                  id={`edge-${type}`}
                  checked={filters.visibleEdgeTypes.has(type)}
                  onCheckedChange={() => toggleEdgeType(type)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
