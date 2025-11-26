import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/shared/ui/button'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <>
      {/* Hero */}
      <section className="pt-14 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground mb-3">{t('home.badge', 'Open Alpha')}</p>

            <h1 className="text-4xl font-semibold tracking-tight leading-tight">
              {t('home.headline', 'Think in graphs,')}
              <br />
              {t('home.headlinePart2', 'not lists')}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t(
                'home.subheadline',
                'A visual workspace for organizing knowledge and discovering connections.'
              )}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Button asChild>
                <Link to="/auth/sign-up">
                  {t('home.cta.getStartedFree', 'Get Started Free')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing">{t('home.nav.pricing', 'View Pricing')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-lg border bg-muted/30 aspect-[16/9] flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              {t('home.productDemo', 'Product screenshot')}
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xl font-semibold mb-8">{t('home.features.title', 'Built for deep work')}</h2>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="font-medium mb-1">Graph-based thinking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualize connections between ideas. See patterns emerge naturally as your knowledge base
                grows.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Hierarchical structure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organize thoughts with nested nodes. Zoom in on details or zoom out for the big picture.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Fast and responsive</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built with React Flow. Handles thousands of nodes with smooth 60fps interactions.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Local-first</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data stays on your machine. Export anytime in standard formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('home.cta.ready', 'Ready to start?')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('home.cta.freeInfo', 'Free tier available. No credit card required.')}
              </p>
            </div>
            <Button asChild>
              <Link to="/auth/sign-up">{t('home.cta.createAccount', 'Create Free Account')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
