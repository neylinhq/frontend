import { LayoutGrid, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'
import { useGraphViewStore } from '../store/graph-view-store'
import type { LayoutAlgorithm } from '../store/graph-view-store'

const layouts: { value: LayoutAlgorithm; label: string }[] = [
  { value: 'elk', label: 'Hierarchical (ELK)' },
  { value: 'dagre', label: 'Hierarchical (Dagre)' },
  { value: 'force', label: 'Force-Directed' },
  { value: 'radial', label: 'Radial' },
  { value: 'grid', label: 'Grid' }
]

export function LayoutSelector() {
  const { t } = useTranslation()
  const { layout, setLayout } = useGraphViewStore()

  const currentLayout = layouts.find((l) => l.value === layout.algorithm)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span className="text-xs">{currentLayout?.label || 'Layout'}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{t('graph.toolbar.selectLayout')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {layouts.map((layoutOption) => (
          <DropdownMenuItem
            key={layoutOption.value}
            onClick={() => setLayout(layoutOption.value)}
            className={layout.algorithm === layoutOption.value ? 'bg-accent' : ''}
          >
            {layoutOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
