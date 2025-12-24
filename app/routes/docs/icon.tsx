import { MessageChatCircleIcon } from '@untitledui/icons-react/outline'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
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

const TOC_ITEMS: TocItem[] = [
  { id: 'ai-brands', title: 'AI Brands', level: 2 },
  { id: 'payment-brands', title: 'Payment Brands', level: 2 },
  { id: 'crypto', title: 'Cryptocurrency', level: 2 },
  { id: 'networks', title: 'Blockchain Networks', level: 2 },
  { id: 'oauth', title: 'OAuth Providers', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const AI_BRAND_KEYS = [
  'openai',
  'anthropic',
  'claude',
  'deepseek',
  'gemini',
  'meta',
  'mistral',
  'xai',
  'perplexity',
  'huggingface',
  'minimax'
]

const PAYMENT_KEYS = ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay']
const CRYPTO_KEYS = ['btc', 'eth', 'usdt', 'usdc', 'sol']
const NETWORK_KEYS = ['ton', 'tron', 'bsc', 'polygon', 'ethereum']
const OAUTH_KEYS = ['github', 'telegram', 'google']

const IconPage = () => {
  return (
    <DocsPageLayout
      title='Icon'
      description='SVG icon component for brand logos. Monochrome icons that adapt to currentColor.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='ai-brands' title='AI Brands' description='Icons for AI providers and models.'>
        <DocsComponentPreview
          code={`import { Icon } from '@/shared/components/icon'
import { aiBrandIcons } from '@/shared/components/icon/icon.constants'

<Icon data={aiBrandIcons['openai']} className='w-6 h-6' />
<Icon data={aiBrandIcons['anthropic']} className='w-6 h-6' />`}
        >
          <DocsPreview className='flex flex-wrap justify-center gap-6'>
            {AI_BRAND_KEYS.map(key => (
              <div key={key} className='flex flex-col items-center gap-2'>
                <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                  {aiBrandIcons[key] ? (
                    <Icon data={aiBrandIcons[key]} className='w-6 h-6' />
                  ) : (
                    <MessageChatCircleIcon className='w-6 h-6' />
                  )}
                </div>
                <span className='text-xs text-muted-foreground'>{key}</span>
              </div>
            ))}
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection
        id='payment-brands'
        title='Payment Brands'
        description='Payment method and card brand icons.'
        bordered
      >
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
      </DocsSection>

      <DocsSection id='crypto' title='Cryptocurrency' description='Cryptocurrency token icons.' bordered>
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
      </DocsSection>

      <DocsSection
        id='networks'
        title='Blockchain Networks'
        description='Blockchain network icons for crypto payments.'
        bordered
      >
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
      </DocsSection>

      <DocsSection
        id='oauth'
        title='OAuth Providers'
        description='Social login and OAuth provider icons.'
        bordered
      >
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Icon } from '@/shared/components/icon'
import { aiBrandIcons } from '@/shared/components/icon/icon.constants'
import { MessageChatCircleIcon } from '@untitledui/icons-react/outline'

function ChatAvatar({ brand }: { brand?: string }) {
  return (
    <div className='w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center'>
      {brand && aiBrandIcons[brand] ? (
        <Icon data={aiBrandIcons[brand]} className='w-4 h-4 text-primary' />
      ) : (
        <MessageChatCircleIcon className='w-4 h-4 text-primary' />
      )}
    </div>
  )
}`}
        />
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='props'
          rows={[
            { name: 'data', type: 'IconData', defaultValue: 'required' },
            { name: 'size', type: 'number | string', defaultValue: '24' },
            { name: 'className', type: 'string', defaultValue: '-' }
          ]}
        />

        <Typography variant='h3' className='pt-4'>
          IconData
        </Typography>
        <div className='rounded-lg border overflow-hidden'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='text-left px-4 py-3 font-medium'>Prop</th>
                <th className='text-left px-4 py-3 font-medium'>Type</th>
                <th className='text-left px-4 py-3 font-medium'>Description</th>
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
      </DocsSection>
    </DocsPageLayout>
  )
}

export default IconPage
