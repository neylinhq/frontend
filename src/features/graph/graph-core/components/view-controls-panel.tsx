import {
  Map01Icon,
  Maximize01Icon,
  Minimize01Icon,
  SearchMdIcon,
  Sliders04Icon,
  Target01Icon,
  ZoomInIcon,
  ZoomOutIcon
} from '@untitledui/icons-react/outline'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LightweightNode } from '@/entities/node'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { Slider } from '@/shared/components/slider'
import { cn } from '@/shared/lib/cn'
import { isMac } from '@/shared/lib/platform'

import { useGraphUI, useNodeSpacing } from '../model/graph.store'
import { NodeSearch } from './node-search'

interface ViewControlsPanelProps {
  mapId: string
  mapTitle?: string
  zoom: number
  isFullscreen: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  onToggleFullscreen: () => void
  nodes?: LightweightNode[]
  onNodeSelect?: (node: LightweightNode) => void
  settingsOpen?: boolean
  onSettingsOpenChange?: (open: boolean) => void
  /** Render prop for map settings drawer — injected by widget */
  renderSettingsDrawer?: (mapId: string, open: boolean, onOpenChange: (open: boolean) => void) => React.ReactNode
  className?: string
}

export const ViewControlsPanel = memo(
  ({
    mapId,
    mapTitle,
    zoom,
    isFullscreen,
    onZoomIn,
    onZoomOut,
    onCenter,
    onToggleFullscreen,
    nodes,
    onNodeSelect,
    settingsOpen,
    onSettingsOpenChange,
    renderSettingsDrawer,
    className
  }: ViewControlsPanelProps) => {
    const { t } = useTranslation()
    const { showMinimap, toggleMinimap } = useGraphUI()
    const [searchOpen, setSearchOpen] = useState(false)
    const [internalSettingsOpen, setInternalSettingsOpen] = useState(false)
    const isSettingsControlled = settingsOpen !== undefined
    const resolvedSettingsOpen = isSettingsControlled ? settingsOpen : internalSettingsOpen
    const setSettingsOpen =
      isSettingsControlled && onSettingsOpenChange ? onSettingsOpenChange : setInternalSettingsOpen
    const {
      nodeSpacing,
      setNodeSpacing,
      directionStrength,
      setDirectionStrength,
      animationDuration,
      setAnimationDuration
    } = useNodeSpacing()

    // Local state for smooth slider movement - only sync to store on commit
    const [localSpacing, setLocalSpacing] = useState(nodeSpacing)
    const [localDirection, setLocalDirection] = useState(directionStrength)
    const [localAnimation, setLocalAnimation] = useState(animationDuration)

    // Sync local state when store values change externally
    useEffect(() => setLocalSpacing(nodeSpacing), [nodeSpacing])
    useEffect(() => setLocalDirection(directionStrength), [directionStrength])
    useEffect(() => setLocalAnimation(animationDuration), [animationDuration])

    const hasLayoutChanges =
      nodeSpacing !== 100 || directionStrength !== 100 || animationDuration !== 300

    return (
      <div className={cn('absolute top-4 left-4 z-10', className)}>
        <Card className='flex items-center gap-2 px-2 py-1.5 border border-border rounded-xl'>
          {/* 1. Map Title — context first */}
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setSettingsOpen(true)}
            className='h-8 px-2.5 max-w-48 group'
            title={t('mapSettings.title')}
          >
            <span className='truncate text-sm font-medium'>{mapTitle || t('common.untitled')}</span>
          </Button>
          {renderSettingsDrawer?.(mapId, resolvedSettingsOpen, setSettingsOpen)}

          {/* 2. Search — high frequency action */}
          {nodes && nodes.length > 0 && onNodeSelect && (
            <>
              <div className='h-5 w-px bg-border/60' />
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setSearchOpen(true)}
                className='h-8 w-8 p-0'
                title={`${t('graph.search.title', 'Search nodes')} (${isMac ? '⌘' : 'Ctrl+'}K)`}
              >
                <SearchMdIcon className='w-4 h-4' />
              </Button>
              <NodeSearch
                nodes={nodes}
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onSelect={onNodeSelect}
              />
            </>
          )}

          <div className='h-5 w-px bg-border/60' />

          {/* 3. View settings */}
          {/* Minimap toggle */}
          <Button
            size='sm'
            variant={showMinimap ? 'secondary' : 'ghost'}
            onClick={toggleMinimap}
            className='h-8 w-8 p-0'
            title={showMinimap ? t('graph.toolbar.hideMinimap') : t('graph.toolbar.showMinimap')}
          >
            <Map01Icon className='w-4 h-4' />
          </Button>

          {/* Layout settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='sm'
                variant={hasLayoutChanges ? 'secondary' : 'ghost'}
                className='h-8 w-8 p-0'
                title={t('graph.toolbar.layoutSettings')}
              >
                <Sliders04Icon className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-56 p-3'>
              <div className='space-y-3'>
                {/* Spacing slider */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-muted-foreground'>
                      {t('graph.toolbar.spacing')}
                    </span>
                    <span className='text-xs font-medium'>{localSpacing}%</span>
                  </div>
                  <Slider
                    value={[localSpacing]}
                    onValueChange={([value]) => setLocalSpacing(value)}
                    onValueCommit={([value]) => setNodeSpacing(value)}
                    min={50}
                    max={300}
                    step={10}
                    className='w-full'
                  />
                </div>

                {/* Direction strength slider */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-muted-foreground'>
                      {t('graph.toolbar.direction')}
                    </span>
                    <span className='text-xs font-medium'>{localDirection}</span>
                  </div>
                  <Slider
                    value={[localDirection]}
                    onValueChange={([value]) => setLocalDirection(value)}
                    onValueCommit={([value]) => setDirectionStrength(value)}
                    min={0}
                    max={200}
                    step={10}
                    className='w-full'
                  />
                  <p className='text-xs text-muted-foreground'>
                    {t('graph.toolbar.directionHint')}
                  </p>
                </div>

                {/* Animation speed slider */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-muted-foreground'>
                      {t('graph.toolbar.animationSpeed')}
                    </span>
                    <span className='text-xs font-medium'>{localAnimation}ms</span>
                  </div>
                  <Slider
                    value={[localAnimation]}
                    onValueChange={([value]) => setLocalAnimation(value)}
                    onValueCommit={([value]) => setAnimationDuration(value)}
                    min={0}
                    max={750}
                    step={50}
                    className='w-full'
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen toggle */}
          <Button
            size='sm'
            variant={isFullscreen ? 'secondary' : 'ghost'}
            onClick={onToggleFullscreen}
            className='h-8 w-8 p-0'
            title={isFullscreen ? t('graph.toolbar.exitFullscreen') : t('graph.toolbar.fullscreen')}
          >
            {isFullscreen ? (
              <Minimize01Icon className='w-4 h-4' />
            ) : (
              <Maximize01Icon className='w-4 h-4' />
            )}
          </Button>

          {/* Center view */}
          <Button
            size='sm'
            variant='ghost'
            onClick={onCenter}
            className='h-8 w-8 p-0'
            title={t('graph.toolbar.centerTooltip')}
          >
            <Target01Icon className='w-4 h-4' />
          </Button>

          <div className='h-5 w-px bg-border/60' />

          {/* 4. Zoom controls — rightmost, heaviest visually */}
          <Button
            size='sm'
            variant='ghost'
            onClick={onZoomOut}
            className='h-8 w-8 p-0'
            title={t('graph.toolbar.zoomOut')}
          >
            <ZoomOutIcon className='w-4 h-4' />
          </Button>

          <span className='text-xs font-medium text-muted-foreground min-w-12 text-center'>
            {Math.round(zoom)}%
          </span>

          <Button
            size='sm'
            variant='ghost'
            onClick={onZoomIn}
            className='h-8 w-8 p-0'
            title={t('graph.toolbar.zoomIn')}
          >
            <ZoomInIcon className='w-4 h-4' />
          </Button>
        </Card>
      </div>
    )
  }
)

ViewControlsPanel.displayName = 'ViewControlsPanel'
