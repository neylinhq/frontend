import { Maximize2, Minimize2, ZoomIn, ZoomOut, Focus, MapIcon, Sparkles } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/cn'

interface GraphToolbarProps {
  zoom: number
  isFullscreen: boolean
  showMinimap: boolean
  mapId: string
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  onToggleFullscreen: () => void
  onToggleMinimap: () => void
  className?: string
}

export const GraphToolbar = memo(
  ({
    zoom,
    isFullscreen,
    showMinimap,
    mapId,
    onZoomIn,
    onZoomOut,
    onCenter,
    onToggleFullscreen,
    onToggleMinimap,
    className
  }: GraphToolbarProps) => {
    const { t } = useTranslation()
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
          <Button size="sm" variant="ghost" asChild className="h-8 px-3 hidden sm:flex" title={t('graph.toolbar.aiAnalysis')}>
            <Link to={`/dashboard/maps/${mapId}/ai`}>
              <Sparkles className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">AI</span>
            </Link>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Center */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onCenter}
            className="h-8 px-3 hidden sm:flex"
            title={t('graph.toolbar.centerTooltip')}
          >
            <Focus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">{t('graph.toolbar.center')}</span>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onZoomOut} className="h-8 w-8 p-0" title={t('graph.toolbar.zoomOut')}>
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
              {Math.round(zoom)}%
            </span>

            <Button size="sm" variant="ghost" onClick={onZoomIn} className="h-8 w-8 p-0" title={t('graph.toolbar.zoomIn')}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Minimap toggle */}
          <Button
            size="sm"
            variant={showMinimap ? 'secondary' : 'ghost'}
            onClick={onToggleMinimap}
            className="h-8 w-8 p-0 hidden md:flex"
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

GraphToolbar.displayName = 'GraphToolbar'
