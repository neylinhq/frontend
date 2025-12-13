import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { sessionApi } from '@/entities/session'
import { ApiError } from '@/shared/api/client'
import { Button } from '@/shared/components/button'
import { Icon, telegramIcon } from '@/shared/components/icon'
import { toast } from '@/shared/components/toast'

// Telegram Login Widget types
interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void
  }
}

type TelegramLoginButtonProps = {
  className?: string
}

export const TelegramLoginButton = ({ className }: TelegramLoginButtonProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [botId, setBotId] = useState('')

  // Fetch bot info from API
  useEffect(() => {
    sessionApi
      .getTelegramBotInfo()
      .then(info => {
        setBotId(info.bot_id)
      })
      .catch(() => {
        // Silently fail - button will be disabled
      })
  }, [])

  // Handle Telegram auth callback
  const handleTelegramAuth = useCallback(
    async (user: TelegramUser) => {
      setIsLoading(true)
      try {
        await sessionApi.telegramLogin({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: user.auth_date,
          hash: user.hash
        })
        const returnUrl = searchParams.get('from') || '/dashboard/overview'
        navigate(returnUrl)
      } catch (error) {
        if (error instanceof ApiError) {
          const errorData = error.data as { error?: { message?: string } } | null
          toast.error(t('auth.telegram.error'), {
            description: errorData?.error?.message || t('auth.telegram.errorDescription')
          })
        } else {
          toast.error(t('auth.telegram.error'), {
            description: t('auth.telegram.errorDescription')
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [navigate, searchParams, t]
  )

  // Set up global callback for Telegram widget
  useEffect(() => {
    window.onTelegramAuth = handleTelegramAuth
    return () => {
      delete window.onTelegramAuth
    }
  }, [handleTelegramAuth])

  const openTelegramLogin = () => {
    if (!botId) {
      return
    }

    // Open Telegram Login Widget in popup
    const width = 550
    const height = 470
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // TODO: Remove hardcoded origin after testing
    const origin = 'http://neylin.io:5173'

    const popup = window.open(
      `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(origin)}&request_access=write`,
      'telegram_oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://oauth.telegram.org') {
        return
      }

      // Parse JSON string if needed
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

      if (data?.event === 'auth_result' && data?.result) {
        handleTelegramAuth(data.result)
        popup?.close()
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup when popup closes
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage)
      }
    }, 500)
  }

  return (
    <Button
      variant='outline'
      className={className}
      type='button'
      disabled={!botId || isLoading}
      onClick={openTelegramLogin}
    >
      {isLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Icon data={telegramIcon} size={16} className='mr-2' />
      )}
      {isLoading ? t('auth.telegram.loading') : t('auth.telegram.button')}
    </Button>
  )
}
