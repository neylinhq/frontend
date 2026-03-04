import { Loading02Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@/shared/components/button'

export interface LoadMoreButtonProps extends Omit<ButtonProps, 'children'> {
  isLoading?: boolean
  hasMore: boolean
  onLoadMore: () => void
  loadingText?: string
  loadMoreText?: string
}

export const LoadMoreButton = ({
  isLoading = false,
  hasMore,
  onLoadMore,
  loadingText,
  loadMoreText,
  className,
  ...props
}: LoadMoreButtonProps) => {
  const { t } = useTranslation()

  if (!hasMore) {
    return null
  }

  return (
    <Button
      variant='outline'
      onClick={onLoadMore}
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loading02Icon className='h-4 w-4 animate-spin' />
          {loadingText ?? t('common.loading')}
        </>
      ) : (
        (loadMoreText ?? t('common.loadMore'))
      )}
    </Button>
  )
}
