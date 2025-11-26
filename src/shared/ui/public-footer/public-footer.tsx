import { APP_NAME, CURRENT_YEAR } from '@/shared/config/app'
import { LegalLinks } from '../legal-links'

export function PublicFooter() {

  return (
    <footer className="py-6 border-t">
      <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-sm text-muted-foreground">
        <span>
          © {CURRENT_YEAR} {APP_NAME}
        </span>
        <LegalLinks variant="footer" />
      </div>
    </footer>
  )
}
