import { ArrowRight, ChevronDown, Layers, Zap, Lock, Globe, Users, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { motion } from 'framer-motion'

import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'
import { HeroGraph } from '@/shared/ui/hero-graph'
import { APP_NAME } from '@/shared/config/app'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Grid overlay for tech aesthetic */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                           linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="lg" />

          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <Link to="/pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 text-[13px]">
                <Link to="/auth/sign-in">{t('home.cta.signIn')}</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-[13px] bg-brand hover:bg-brand/90 text-brand-foreground">
                <Link to="/auth/sign-up">{t('home.cta.getStarted')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-14">
        <HeroGraph className="opacity-50 dark:opacity-40" nodeCount={70} connectionDistance={160} />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--brand-muted),transparent)]" />

        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="max-w-3xl">
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-brand">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                  </span>
                  {t('home.alphaNotice')}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[clamp(2.5rem,8vw,5rem)] font-bold leading-[0.95] tracking-tight"
              >
                <span className="block">{t('home.headline', 'Think visually.')}</span>
                <span className="block mt-2 bg-gradient-to-r from-brand to-brand/60 bg-clip-text text-transparent">
                  {t('home.headlineSub', 'Build connections.')}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed text-balance"
              >
                {t('home.tagline', 'Visualize and structure your knowledge with interactive cognitive maps. Create, connect, and explore your ideas in an intuitive graph-based workspace.')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Button asChild size="lg" className="h-11 px-6 bg-brand hover:bg-brand/90 text-brand-foreground font-medium">
                  <Link to="/auth/sign-up">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 px-6 font-medium">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </motion.div>

              {/* Stats inline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-12 pt-8 border-t border-border/50 grid grid-cols-3 gap-4 sm:gap-8 max-w-md"
              >
                {[
                  { value: '10K+', label: 'Users' },
                  { value: '500K+', label: 'Notes' },
                  { value: '99.9%', label: 'Uptime' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl sm:text-2xl font-bold text-brand">{stat.value}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.a
              href="#features"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-widest">Scroll</span>
              <ChevronDown className="h-4 w-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 lg:py-32 border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-20">
            {/* Left - sticky header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <span className="text-[11px] font-medium uppercase tracking-widest text-brand">Features</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
                Everything you need to organize knowledge
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Powerful yet intuitive tools designed for the way you think.
              </p>
            </motion.div>

            {/* Right - feature grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Layers, title: 'Visual Thinking', desc: 'Transform abstract concepts into clear visual structures that mirror your thought process.' },
                { icon: Zap, title: 'Instant Connections', desc: 'Link ideas together with a click and watch your knowledge graph grow organically.' },
                { icon: Globe, title: 'AI-Powered', desc: 'Let AI suggest connections and help you discover patterns in your knowledge.' },
                { icon: Lock, title: 'Private & Secure', desc: 'End-to-end encryption ensures your thoughts remain yours alone.' },
                { icon: Users, title: 'Collaborate', desc: 'Share specific graphs or entire workspaces with your team.' },
                { icon: TrendingUp, title: 'Analytics', desc: 'Track your knowledge growth with detailed insights and patterns.' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group relative p-5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-brand/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand/15 transition-colors">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 lg:py-32 border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-brand">How it works</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to clarity
            </h2>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { num: '01', title: 'Create', desc: 'Add your ideas, notes, and concepts as visual nodes in your workspace.' },
              { num: '02', title: 'Connect', desc: 'Draw connections between related concepts. Watch patterns emerge.' },
              { num: '03', title: 'Discover', desc: 'Navigate your graph to find insights you never knew existed.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[80px] sm:text-[100px] font-bold leading-none text-brand/10 select-none">
                  {step.num}
                </div>
                <div className="-mt-8 sm:-mt-10 relative">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 lg:py-32 border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-brand">Testimonials</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
              Trusted by thinkers
            </h2>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { quote: "Finally, a tool that matches how my brain actually works. The visual connections make everything click.", author: "Sarah K.", role: "Researcher" },
              { quote: "I've tried every note-taking app. This is the first one that helps me think, not just store information.", author: "Michael R.", role: "Product Manager" },
              { quote: "The graph view changed how I approach complex projects. Big picture and details, all at once.", author: "Elena V.", role: "Writer" },
            ].map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative p-6 rounded-xl border border-border/50 bg-card/30"
              >
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-sm font-medium">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 via-transparent to-brand/5 p-8 sm:p-12 lg:p-16"
          >
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to think differently?
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Join thousands who organize knowledge visually. Free to start, no credit card required.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="h-11 px-8 bg-brand hover:bg-brand/90 text-brand-foreground font-medium">
                  <Link to="/auth/sign-up">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} {APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1)}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/pricing" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/legal/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">{t('legal.terms.title')}</Link>
              <Link to="/legal/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">{t('legal.privacy.title')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
