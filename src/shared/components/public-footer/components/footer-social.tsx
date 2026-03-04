import { SUPPORT_CONTACTS } from '@/shared/config/support'

export const FooterSocial = () => {
  return (
    <>
      <a
        href={SUPPORT_CONTACTS.telegram.url}
        target='_blank'
        rel='noopener noreferrer'
        className='hover:text-foreground transition-colors'
      >
        telegram
      </a>
      <a href={SUPPORT_CONTACTS.email.url} className='hover:text-foreground transition-colors'>
        mail
      </a>
    </>
  )
}
