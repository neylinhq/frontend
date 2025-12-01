import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/typography'

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

const TYPOGRAPHY_EXAMPLES = [
  {
    variant: 'h1' as const,
    label: 'Heading 1',
    example: 'The quick brown fox jumps over the lazy dog',
    code: '<Typography variant="h1">Heading 1</Typography>'
  },
  {
    variant: 'h2' as const,
    label: 'Heading 2',
    example: 'The quick brown fox jumps over the lazy dog',
    code: '<Typography variant="h2">Heading 2</Typography>'
  },
  {
    variant: 'h3' as const,
    label: 'Heading 3',
    example: 'The quick brown fox jumps over the lazy dog',
    code: '<Typography variant="h3">Heading 3</Typography>'
  },
  {
    variant: 'h4' as const,
    label: 'Heading 4',
    example: 'The quick brown fox jumps over the lazy dog',
    code: '<Typography variant="h4">Heading 4</Typography>'
  },
  {
    variant: 'p' as const,
    label: 'Paragraph',
    example:
      'The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    code: '<Typography variant="p">Paragraph text</Typography>'
  },
  {
    variant: 'lead' as const,
    label: 'Lead',
    example: 'A larger paragraph for introductions and important text.',
    code: '<Typography variant="lead">Lead text</Typography>'
  },
  {
    variant: 'large' as const,
    label: 'Large',
    example: 'Large text for emphasis',
    code: '<Typography variant="large">Large text</Typography>'
  },
  {
    variant: 'small' as const,
    label: 'Small',
    example: 'Small text for captions and labels',
    code: '<Typography variant="small">Small text</Typography>'
  },
  {
    variant: 'muted' as const,
    label: 'Muted',
    example: 'Muted text for secondary information',
    code: '<Typography variant="muted">Muted text</Typography>'
  },
  {
    variant: 'blockquote' as const,
    label: 'Blockquote',
    example: 'This is a blockquote. Use it for citations and important quotes.',
    code: '<Typography variant="blockquote">Quote</Typography>'
  },
  {
    variant: 'inline-code' as const,
    label: 'Inline Code',
    example: 'const example = true',
    code: '<Typography variant="inline-code">code</Typography>'
  }
]

const TypographyPage = () => {
  const { t } = useTranslation()

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <Typography variant='h1'>{t('docs.typography.title')}</Typography>
        <Typography variant='lead'>{t('docs.typography.lead')}</Typography>
      </div>

      {/* Examples */}
      <section className='space-y-6'>
        <div>
          <Typography variant='h2'>{t('docs.typography.variants.title')}</Typography>
          <Typography variant='muted'>{t('docs.typography.variants.description')}</Typography>
        </div>

        <div className='space-y-8'>
          {TYPOGRAPHY_EXAMPLES.map(item => (
            <Card key={item.variant}>
              <CardHeader>
                <CardTitle className='text-base'>{item.label}</CardTitle>
                <CardDescription>
                  <code className='text-xs bg-muted px-2 py-0.5 rounded'>{item.code}</code>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border bg-muted/30 p-6'>
                  <Typography variant={item.variant}>{item.example}</Typography>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Font */}
      <section className='space-y-4 pt-4 border-t'>
        <Typography variant='h2'>Шрифт</Typography>
        <Card>
          <CardHeader>
            <CardTitle>IBM Plex Sans</CardTitle>
            <CardDescription>
              Технический, геометрический шрифт для профессионального вида
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Typography variant='small' className='font-light'>
                Light: The quick brown fox jumps over the lazy dog
              </Typography>
              <Typography variant='small' className='font-normal'>
                Regular: The quick brown fox jumps over the lazy dog
              </Typography>
              <Typography variant='small' className='font-medium'>
                Medium: The quick brown fox jumps over the lazy dog
              </Typography>
              <Typography variant='small' className='font-semibold'>
                Semibold: The quick brown fox jumps over the lazy dog
              </Typography>
              <Typography variant='small' className='font-bold'>
                Bold: The quick brown fox jumps over the lazy dog
              </Typography>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Usage */}
      <section className='space-y-4 pt-4 border-t'>
        <Typography variant='h2'>Usage</Typography>
        <Card>
          <CardHeader>
            <CardTitle>Использование компонента</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Typography variant='small' className='mb-2'>
                Базовое использование:
              </Typography>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-sm'>{`import { Typography } from '@/shared/ui/typography'

<Typography variant="h1">Заголовок</Typography>
<Typography variant="p">Параграф текста</Typography>
<Typography variant="muted">Вторичная информация</Typography>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant='small' className='mb-2'>
                Кастомный HTML тег:
              </Typography>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-sm'>{`<Typography variant="large" as="span">
  Span с large стилями
</Typography>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant='small' className='mb-2'>
                С дополнительными классами:
              </Typography>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-sm'>{`<Typography variant="p" className="text-center max-w-lg">
  Центрированный параграф с ограничением ширины
</Typography>`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default TypographyPage
