import type * as React from 'react'

import { ModeToggle } from '@/features/settings/mode-toggle'
import { LanguageSwitcher } from '@/shared/components/language-switcher'
import { Logo } from '@/shared/components/logo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-8'>
      {/* Controls - top right */}
      <div className='fixed top-4 right-4 z-50 flex items-center gap-2'>
        <LanguageSwitcher />
        <ModeToggle />
      </div>

      {/* Logo */}
      <Logo size='3xl' href='/' className='mb-8' />

      {/* Form */}
      <div className='w-full max-w-sm space-y-6'>{children}</div>
    </div>
  )
}
