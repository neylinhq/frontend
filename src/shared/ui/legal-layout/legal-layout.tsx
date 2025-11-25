import { ArrowLeft, Cookie, FileCheck, FileText, Shield } from 'lucide-react'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Logo } from '@/shared/ui/logo'

interface LegalLayoutProps {
  children: React.ReactNode
  pageType?: 'terms' | 'privacy' | 'cookies' | 'license'
}

const PAGE_ICONS = {
  terms: FileText,
  privacy: Shield,
  cookies: Cookie,
  license: FileCheck
}

export const LegalLayout = ({ children, pageType }: LegalLayoutProps) => {
  const { t } = useTranslation()
  const Icon = pageType ? PAGE_ICONS[pageType] : FileText

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Logo size="xl" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-4xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('legal.backToHome')}
          </Link>

          {/* Content Card */}
          <div className="pt-10 md:pt-16">
            {pageType && (
              <div className="flex items-center gap-4 mb-10">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="[&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-border/50 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-10 [&_h3]:mb-4 [&_p]:text-base [&_p]:leading-8 [&_p]:text-foreground/90 [&_p]:mb-6 [&_.lead]:text-xl [&_.lead]:leading-8 [&_.lead]:text-muted-foreground [&_.lead]:mb-10 [&_.lead]:font-normal [&_a]:text-primary [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:my-8 [&_ul]:space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:text-base [&_li]:leading-7 [&_li]:text-foreground/90 [&_li]:pl-2 [&_code]:text-sm [&_code]:font-mono [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-primary [&_code]:font-medium [&_table]:w-full [&_table]:border-collapse [&_table]:my-10 [&_thead]:bg-muted/50 [&_thead]:border-b-2 [&_thead]:border-border [&_th]:px-6 [&_th]:py-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:text-base [&_td]:px-6 [&_td]:py-4 [&_td]:border-t [&_td]:border-border [&_td]:text-foreground/85 [&_td]:text-base [&_tbody]:divide-y [&_tbody]:divide-border [&_.text-sm]:text-sm [&_.text-sm]:text-muted-foreground [&_.text-sm]:mb-10 [&_.text-sm]:font-medium [&_.overflow-x-auto]:overflow-x-auto [&_.overflow-x-auto]:rounded-xl [&_.overflow-x-auto]:border [&_.overflow-x-auto]:border-border [&_.overflow-x-auto]:my-8 [&_.overflow-x-auto]:shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 md:py-10 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <div className="font-medium">
              © {new Date().getFullYear()} Arbor. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/legal/terms"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.terms.title')}
              </Link>
              <Link
                to="/legal/privacy"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.privacy.title')}
              </Link>
              <Link
                to="/legal/cookies"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.cookies.title')}
              </Link>
              <Link
                to="/legal/license"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {t('legal.license.title')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
