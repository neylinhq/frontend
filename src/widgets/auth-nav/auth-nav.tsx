import { useLoaderUser } from '@/entities/user'
import { UserNav } from '@/widgets/user-nav'
import { Button } from '@/shared/components/button'
import { Link } from 'react-router'
import { AUTH_ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

interface AuthNavProps {
  compact?: boolean
  className?: string
  showSeparator?: boolean
}

export const AuthNav = ({ compact = false, className, showSeparator = true }: AuthNavProps) => {
  const user = useLoaderUser()

  return (
    <>
      {showSeparator && <div className='hidden md:block h-4 w-px bg-border mx-1' />}
      {user ? (
        <UserNav />
      ) : (
        <div className={cn('hidden md:flex items-center gap-2', className)}>
          <Button asChild variant='ghost' size={compact ? 'sm' : 'default'}>
            <Link to={AUTH_ROUTES.signIn}>Sign in</Link>
          </Button>
          <Button asChild size={compact ? 'sm' : 'default'}>
            <Link to={AUTH_ROUTES.signUp}>Get Started</Link>
          </Button>
        </div>
      )}
    </>
  )
}
