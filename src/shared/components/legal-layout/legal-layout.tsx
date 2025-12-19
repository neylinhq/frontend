import { ArrowLeftIcon } from '@untitledui/icons-react/outline'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ROUTES } from '@/shared/config'

interface LegalLayoutProps {
  children: React.ReactNode
}

export const LegalLayout = ({ children }: LegalLayoutProps) => {
  const { t } = useTranslation()

  return (
    <div className='py-8 md:py-16'>
      <div className='max-w-4xl mx-auto px-6'>
        {/* Back Button */}
        <Link
          to={ROUTES.home}
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          {t('legal.backToHome', 'Back to Home')}
        </Link>

        {/* Content with base typography styles */}
        <div className='[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border/50 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-base [&_p]:leading-7 [&_p]:text-muted-foreground [&_p]:mb-4 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground/80 [&_strong]:text-foreground [&_strong]:font-medium [&_ul]:my-6 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:text-base [&_li]:leading-7 [&_li]:text-muted-foreground [&_code]:text-sm [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_thead]:bg-muted/50 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground [&_th]:text-sm [&_td]:px-4 [&_td]:py-3 [&_td]:border-t [&_td]:border-border [&_td]:text-muted-foreground [&_td]:text-sm'>
          {children}
        </div>
      </div>
    </div>
  )
}
