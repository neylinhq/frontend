import type * as React from 'react'
import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { APP_NAME } from '@/shared/config'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Navbar for mobile/desktop auth pages */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Left: Decorative */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&auto=format&fit=crop&w=1376&q=80)'
          }}
        />
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <div className="h-6 w-6 rounded bg-white" /> {/* Logo placeholder (white for contrast) */}
          {APP_NAME}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-balance">
              &ldquo;This library has saved me countless hours of work and helped me deliver
              stunning designs to my clients faster than ever before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">{children}</div>
      </div>
    </div>
  )
}
