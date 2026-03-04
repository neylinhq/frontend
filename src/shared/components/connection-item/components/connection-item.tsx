import { LinkExternal01Icon, EyeIcon, Pencil01Icon, Trash01Icon } from '@untitledui/icons-react/outline'
import { memo } from 'react'
import { cn } from '@/shared/lib/cn'

interface ConnectionItemProps {
  icon: React.ReactNode
  iconContainerClassName?: string
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
    iconContainerClassName,
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
      <div
        className={cn(
          'group w-full text-left rounded-sm transition-colors duration-150 cursor-pointer',
          className
        )}
        onClick={onOpen}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen?.()
          }
        }}
      >
        <div className='flex items-center gap-3'>
          {/* Icon */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-sm flex-shrink-0',
              iconContainerClassName ?? 'bg-muted'
            )}
          >
            {icon}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <span className='block font-medium text-sm truncate'>{label}</span>
            {(subtitle || (showDirectionHint && direction)) && (
              <span className='text-xs text-muted-foreground mt-0.25 flex items-center gap-1 min-w-0'>
                {showDirectionHint && direction && (
                  <span
                    className={cn(
                      'shrink-0 w-4 text-center',
                      direction === 'incoming' ? 'text-info' : 'text-success'
                    )}
                  >
                    {direction === 'incoming' ? '←' : '→'}
                  </span>
                )}
                {subtitle}
              </span>
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
                        'p-1.5 rounded-sm transition-colors cursor-pointer',
                        'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
                      )}
                      title={panToTitle}
                    >
                      <EyeIcon className='w-3.5 h-3.5' />
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
                        'p-1.5 rounded-sm transition-colors cursor-pointer',
                        'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
                      )}
                      title={openTitle}
                    >
                      <LinkExternal01Icon className='w-3.5 h-3.5' />
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
                    'p-1.5 rounded-sm transition-colors cursor-pointer',
                    'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
                  )}
                  title={editTitle}
                >
                  <Pencil01Icon className='w-3.5 h-3.5' />
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
                    'p-1.5 rounded-sm transition-colors cursor-pointer',
                    'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  )}
                  title={deleteTitle}
                >
                  <Trash01Icon className='w-3.5 h-3.5' />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

ConnectionItem.displayName = 'ConnectionItem'
