import { Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Icon } from '@/shared/components/icon'
import {
  aiBrandIcons,
  cryptoIcons,
  networkIcons,
  oauthBrandIcons,
  paymentBrandIcons
} from '@/shared/components/icon/icon.constants'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/icon'

export const handle = {
  breadcrumb: 'Icon'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const IconPage = () => {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'ai-brands', title: t('docs.icon.aiBrands', 'AI Brands'), level: 2 },
    { id: 'payment-brands', title: t('docs.icon.paymentBrands', 'Payment Brands'), level: 2 },
    { id: 'crypto', title: t('docs.icon.crypto', 'Cryptocurrency'), level: 2 },
    { id: 'networks', title: t('docs.icon.networks', 'Blockchain Networks'), level: 2 },
    { id: 'oauth', title: t('docs.icon.oauth', 'OAuth Providers'), level: 2 },
    { id: 'usage', title: t('docs.common.usage'), level: 2 },
    { id: 'api-reference', title: t('docs.common.apiReference'), level: 2 }
  ]

  const AI_BRAND_KEYS = [
    'openai',
    'anthropic',
    'deepseek',
    'gemini',
    'meta',
    'mistral',
    'xai',
    'cohere',
    'perplexity',
    'huggingface',
    'minimax'
  ]

  const PAYMENT_KEYS = ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay']
  const CRYPTO_KEYS = ['btc', 'eth', 'usdt', 'usdc', 'sol']
  const NETWORK_KEYS = ['ton', 'tron', 'bsc', 'polygon', 'ethereum']
  const OAUTH_KEYS = ['github', 'telegram', 'google']

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[
              { label: t('docs.common.components'), href: '/docs/ui/button' },
              { label: 'Icon' }
            ]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Icon</Typography>
            <Badge variant='brand'>{t('docs.common.component')}</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            {t(
              'docs.icon.lead',
              'SVG icon component for brand logos. Monochrome icons that adapt to currentColor.'
            )}
          </Typography>
        </header>

        <section id='ai-brands' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.icon.aiBrands', 'AI Brands')}</Typography>
          <Typography variant='muted'>
            {t('docs.icon.aiBrandsDescription', 'Icons for AI providers and models.')}
          </Typography>

          <DocsComponentPreview
            code={`import { Icon } from '@/shared/components/icon'
import { aiBrandIcons } from '@/shared/components/icon/icon.constants'

<Icon data={aiBrandIcons['openai']} className='w-6 h-6' />
<Icon data={aiBrandIcons['anthropic']} className='w-6 h-6' />`}
          >
            <DocsPreview className='flex flex-wrap gap-6'>
              {AI_BRAND_KEYS.map(key => (
                <div key={key} className='flex flex-col items-center gap-2'>
                  <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                    {aiBrandIcons[key] ? (
                      <Icon data={aiBrandIcons[key]} className='w-6 h-6' />
                    ) : (
                      <Bot className='w-6 h-6' />
                    )}
                  </div>
                  <span className='text-xs text-muted-foreground'>{key}</span>
                </div>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='payment-brands' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.icon.paymentBrands', 'Payment Brands')}</Typography>
          <Typography variant='muted'>
            {t('docs.icon.paymentDescription', 'Payment method and card brand icons.')}
          </Typography>

          <DocsComponentPreview
            code={`import { paymentBrandIcons } from '@/shared/components/icon/icon.constants'

<Icon data={paymentBrandIcons['visa']} className='h-6 w-auto' />`}
          >
            <DocsPreview className='flex flex-wrap gap-6'>
              {PAYMENT_KEYS.map(key => (
                <div key={key} className='flex flex-col items-center gap-2'>
                  <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                    {paymentBrandIcons[key] && (
                      <Icon data={paymentBrandIcons[key]} className='w-6 h-6' />
                    )}
                  </div>
                  <span className='text-xs text-muted-foreground'>{key}</span>
                </div>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='crypto' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.icon.crypto', 'Cryptocurrency')}</Typography>
          <Typography variant='muted'>
            {t('docs.icon.cryptoDescription', 'Cryptocurrency token icons.')}
          </Typography>

          <DocsComponentPreview
            code={`import { cryptoIcons } from '@/shared/components/icon/icon.constants'

<Icon data={cryptoIcons['btc']} className='w-6 h-6' />`}
          >
            <DocsPreview className='flex flex-wrap gap-6'>
              {CRYPTO_KEYS.map(key => (
                <div key={key} className='flex flex-col items-center gap-2'>
                  <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                    {cryptoIcons[key] && <Icon data={cryptoIcons[key]} className='w-6 h-6' />}
                  </div>
                  <span className='text-xs text-muted-foreground'>{key}</span>
                </div>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='networks' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.icon.networks', 'Blockchain Networks')}</Typography>
          <Typography variant='muted'>
            {t('docs.icon.networksDescription', 'Blockchain network icons for crypto payments.')}
          </Typography>

          <DocsComponentPreview
            code={`import { networkIcons } from '@/shared/components/icon/icon.constants'

<Icon data={networkIcons['ton']} className='w-6 h-6' />`}
          >
            <DocsPreview className='flex flex-wrap gap-6'>
              {NETWORK_KEYS.map(key => (
                <div key={key} className='flex flex-col items-center gap-2'>
                  <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                    {networkIcons[key] && <Icon data={networkIcons[key]} className='w-6 h-6' />}
                  </div>
                  <span className='text-xs text-muted-foreground'>{key}</span>
                </div>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='oauth' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.icon.oauth', 'OAuth Providers')}</Typography>
          <Typography variant='muted'>
            {t('docs.icon.oauthDescription', 'Social login and OAuth provider icons.')}
          </Typography>

          <DocsComponentPreview
            code={`import { oauthBrandIcons } from '@/shared/components/icon/icon.constants'

<Icon data={oauthBrandIcons['github']} className='w-6 h-6' />`}
          >
            <DocsPreview className='flex flex-wrap gap-6'>
              {OAUTH_KEYS.map(key => (
                <div key={key} className='flex flex-col items-center gap-2'>
                  <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                    {oauthBrandIcons[key] && <Icon data={oauthBrandIcons[key]} className='w-6 h-6' />}
                  </div>
                  <span className='text-xs text-muted-foreground'>{key}</span>
                </div>
              ))}
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.usage')}</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Icon } from '@/shared/components/icon'
import { aiBrandIcons } from '@/shared/components/icon/icon.constants'
import { Bot } from 'lucide-react'

function ChatAvatar({ brand }: { brand?: string }) {
  return (
    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
      {brand && aiBrandIcons[brand] ? (
        <Icon data={aiBrandIcons[brand]} className='w-4 h-4 text-primary' />
      ) : (
        <Bot className='w-4 h-4 text-primary' />
      )}
    </div>
  )
}`}
          />
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.apiReference')}</Typography>

          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.prop')}</th>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.type')}</th>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.default')}</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>data</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>IconData</code>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-xs text-muted-foreground'>required</span>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>size</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>number | string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>24</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>className</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>-</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Typography variant='h3' className='pt-4'>
            IconData
          </Typography>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.prop')}</th>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.type')}</th>
                  <th className='text-left px-4 py-3 font-medium'>
                    {t('docs.common.description', 'Description')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>viewBox</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    SVG viewBox, typically "0 0 24 24"
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>path</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string | string[]</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>SVG path d attribute(s)</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>displayName</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>string?</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>Accessibility label</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default IconPage
