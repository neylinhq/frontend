import { APP_NAME, CURRENT_YEAR } from '@/shared/config/app'
import { LegalLinks } from '../legal-links'

export const PublicFooter = () => {
  return (
    <footer className='py-6 border-t'>
      <div className='max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-6 md:gap-0 items-start md:items-center md:justify-between text-sm text-muted-foreground'>
        <span>
          © {CURRENT_YEAR} {APP_NAME}
        </span>
        <LegalLinks variant='footer' className='flex-wrap gap-4 md:gap-6' />
      </div>
    </footer>
  )
}
