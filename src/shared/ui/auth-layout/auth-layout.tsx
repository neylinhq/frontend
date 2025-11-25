import type * as React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Decorative */}
      <div className="hidden lg:flex flex-col justify-between bg-muted p-10 text-muted-foreground border-r">
        <div className="flex items-center gap-2 font-medium text-foreground text-lg">
          <div className="h-6 w-6 rounded bg-primary" /> {/* Logo placeholder */}
          Arbor
        </div>
        <div>
          <blockquote className="space-y-2">
            <p className="text-lg">
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
