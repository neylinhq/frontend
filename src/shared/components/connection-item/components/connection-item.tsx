import { ExternalLink, Eye, Pencil, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/shared/lib/cn'

interface ConnectionItemProps {
  icon: React.ReactNode
  label: string
  subtitle?: React.ReactNode
  direction?: 'incoming' | 'outgoing'
  showDirectionHint?: boolean
  className?: string
  onOpen?: () => void
  onPanTo?: () => void
  onEdit?: () => void
  onDelete?: () => void
  openTitle?: string
  panToTitle?: string
  editTitle?: string
  deleteTitle?: string
}

export const ConnectionItem = memo(
  ({
    icon,
    label,
    subtitle,
    direction,
    showDirectionHint = true,
    className,
    onOpen,
    onPanTo,
    onEdit,
    onDelete,
    openTitle,
    panToTitle,
    editTitle,
    deleteTitle
  }: ConnectionItemProps) => {
    return (
      <button
        type='button'
        className={cn(
          'group w-full text-left rounded-lg transition-all duration-150',
          'hover:bg-muted/60',
          className
        )}
        onClick={onOpen}
      >
        <div className='flex items-center gap-3 px-3 py-2.5'>
          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0',
              'bg-muted/60 group-hover:bg-muted transition-colors'
            )}
          >
            {icon}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <p className='font-medium text-sm truncate'>{label}</p>
            {(subtitle || (showDirectionHint && direction)) && (
              <p className='text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1'>
                {showDirectionHint && direction && (
                  <span
                    className={cn(
                      'inline-block w-4 text-center',
                      direction === 'incoming' ? 'text-blue-500' : 'text-emerald-500'
                    )}
                  >
                    {direction === 'incoming' ? '←' : '→'}
                  </span>
                )}
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {(onPanTo || onOpen || onEdit || onDelete) && (
            <div className='flex items-center gap-0.5'>
              {/* Navigation actions - show on hover */}
              {(onPanTo || onOpen) && (
                <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {onPanTo && (
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation()
                        onPanTo()
                      }}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        'text-muted-foreground hover:text-foreground hover:bg-background'
                      )}
                      title={panToTitle}
                    >
                      <Eye className='w-3.5 h-3.5' />
                    </button>
                  )}
                  {onOpen && (
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation()
                        onOpen()
                      }}
                      className={cn(
                        'p-1.5 rounded-md transition-colors',
                        'text-muted-foreground hover:text-foreground hover:bg-background'
                      )}
                      title={openTitle}
                    >
                      <ExternalLink className='w-3.5 h-3.5' />
                    </button>
                  )}
                </div>
              )}
              {/* Edit/Delete actions - always visible */}
              {onEdit && (
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    'text-muted-foreground hover:text-foreground hover:bg-background'
                  )}
                  title={editTitle}
                >
                  <Pencil className='w-3.5 h-3.5' />
                </button>
              )}
              {onDelete && (
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  )}
                  title={deleteTitle}
                >
                  <Trash2 className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          )}
        </div>
      </button>
    )
  }
)

ConnectionItem.displayName = 'ConnectionItem'
