import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Logo size="xl" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20 md:py-32 bg-gradient-to-b from-background via-background to-muted/10">
        <div className="max-w-5xl w-full text-center space-y-16">
          {/* Logo & Tagline */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-center mb-6">
              <Logo size="4xl" className="scale-[1.8] md:scale-[2.5]" href={false} />
            </div>
          </div>

          {/* Features */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 min-h-[280px]">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{t('home.features.visual.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  {t('home.features.visual.description')}
                </p>
              </div>
            </div>

            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 min-h-[280px]">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Network className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{t('home.features.connected.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  {t('home.features.connected.description')}
                </p>
              </div>
            </div>

            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-full flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 min-h-[280px]">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{t('home.features.ai.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  {t('home.features.ai.description')}
                </p>
              </div>
            </div>
          </div> */}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto min-w-[180px] h-12 text-base shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/auth/sign-up">
                {t('home.cta.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[180px] h-12 text-base hover:bg-accent/50 transition-all"
            >
              <Link to="/auth/sign-in">{t('home.cta.signIn')}</Link>
            </Button>
          </div>

          {/* Alpha Notice */}
          <div className="pt-8 animate-in fade-in duration-1000 delay-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <span className="text-xs text-muted-foreground">{t('home.alphaNotice')}</span>
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
