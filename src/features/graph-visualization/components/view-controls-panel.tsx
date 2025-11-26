import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  MapIcon,
  Focus,
  SlidersHorizontal,
} from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Slider } from '@/shared/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/cn'
import { useGraphUI, useNodeSpacing } from '@/features/graph-view'

interface ViewControlsPanelProps {
  zoom: number
  isFullscreen: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  onToggleFullscreen: () => void
  className?: string
}

export const ViewControlsPanel = memo(
  ({
    zoom,
    isFullscreen,
    onZoomIn,
    onZoomOut,
    onCenter,
    onToggleFullscreen,
    className,
  }: ViewControlsPanelProps) => {
    const { t } = useTranslation()
    const { showMinimap, toggleMinimap } = useGraphUI()
    const { nodeSpacing, setNodeSpacing, directionStrength, setDirectionStrength } = useNodeSpacing()

    // Local state for smooth slider movement - only sync to store on commit
    const [localSpacing, setLocalSpacing] = useState(nodeSpacing)
    const [localDirection, setLocalDirection] = useState(directionStrength)

    // Sync local state when store values change externally
    useEffect(() => setLocalSpacing(nodeSpacing), [nodeSpacing])
    useEffect(() => setLocalDirection(directionStrength), [directionStrength])

    const hasLayoutChanges = nodeSpacing !== 100 || directionStrength !== 100

    return (
      <div
        className={cn(
          'absolute top-4 left-4 z-10',
          className
        )}
      >
        <Card className="flex items-center gap-1 p-1.5 shadow-lg border">
          {/* Zoom controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomOut}
            className="h-8 w-8 p-0"
            title={t('graph.toolbar.zoomOut')}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoom)}%
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomIn}
            className="h-8 w-8 p-0"
            title={t('graph.toolbar.zoomIn')}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Center */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onCenter}
            className="h-8 w-8 p-0"
            title={t('graph.toolbar.centerTooltip')}
          >
            <Focus className="w-4 h-4" />
          </Button>

          {/* Layout settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant={hasLayoutChanges ? 'secondary' : 'ghost'}
                className="h-8 w-8 p-0"
                title={t('graph.toolbar.layoutSettings')}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-3">
              <div className="space-y-4">
                {/* Spacing slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t('graph.toolbar.spacing')}
                    </span>
                    <span className="text-xs font-medium">{localSpacing}%</span>
                  </div>
                  <Slider
                    value={[localSpacing]}
                    onValueChange={([value]) => setLocalSpacing(value)}
                    onValueCommit={([value]) => setNodeSpacing(value)}
                    min={50}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Direction strength slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t('graph.toolbar.direction')}
                    </span>
                    <span className="text-xs font-medium">{localDirection}</span>
                  </div>
                  <Slider
                    value={[localDirection]}
                    onValueChange={([value]) => setLocalDirection(value)}
                    onValueCommit={([value]) => setDirectionStrength(value)}
                    min={0}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {t('graph.toolbar.directionHint')}
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border" />

          {/* Minimap toggle */}
          <Button
            size="sm"
            variant={showMinimap ? 'secondary' : 'ghost'}
            onClick={toggleMinimap}
            className="h-8 w-8 p-0"
            title={showMinimap ? t('graph.toolbar.hideMinimap') : t('graph.toolbar.showMinimap')}
          >
            <MapIcon className="w-4 h-4" />
          </Button>

          {/* Fullscreen toggle */}
          <Button
            size="sm"
            variant={isFullscreen ? 'secondary' : 'ghost'}
            onClick={onToggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? t('graph.toolbar.exitFullscreen') : t('graph.toolbar.fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </Card>
      </div>
    )
  }
)

ViewControlsPanel.displayName = 'ViewControlsPanel'
