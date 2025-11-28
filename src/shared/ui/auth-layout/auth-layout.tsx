import type * as React from 'react'
import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Logo } from '@/shared/ui/logo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-8'>
      {/* Controls - top right */}
      <div className='fixed top-4 right-4 z-50 flex items-center gap-2'>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Logo */}
      <Logo size='xl' href='/' className='mb-8' />

      {/* Form */}
      <div className='w-full max-w-sm space-y-6'>{children}</div>
    </div>
  )
}
