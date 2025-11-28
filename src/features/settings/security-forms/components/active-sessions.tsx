import { Laptop, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

// Static mock data - in real app this would come from API
const activeSessions = [
  {
    id: '1',
    device: 'Chrome on MacBook Pro',
    location: 'San Francisco, US',
    lastActive: '2 minutes ago',
    current: true,
    icon: Laptop
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'San Francisco, US',
    lastActive: '1 hour ago',
    current: false,
    icon: Smartphone
  }
]

export function ActiveSessions() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.security.sessions.title')}</CardTitle>
        <CardDescription>{t('settings.security.sessions.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activeSessions.map(session => {
          const Icon = session.icon

          return (
            <div
              key={session.id}
              className='flex items-start justify-between p-4 border rounded-lg'
            >
              <div className='flex items-start gap-3'>
                <div className='p-2 rounded-lg bg-muted'>
                  <Icon className='h-4 w-4' />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium'>{session.device}</p>
                    {session.current && (
                      <span className='text-xs text-green-600 dark:text-green-400'>
                        {t('settings.security.sessions.current')}
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>{session.location}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('settings.security.sessions.lastActive')}: {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant='ghost' size='sm'>
                  {t('settings.security.sessions.revoke')}
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
