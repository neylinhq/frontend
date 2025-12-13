import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
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
  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <Typography variant='h1'>Typography</Typography>
        <Typography variant='lead'>
          Type scale and text formatting for consistent hierarchy and readability
        </Typography>
      </div>

      {/* Examples */}
      <section className='space-y-6'>
        <div className='space-y-2'>
          <Typography variant='h2'>Typography Variants</Typography>
          <Typography variant='muted'>All available text styles</Typography>
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
        <Typography variant='h2'>Font</Typography>
        <Card>
          <CardHeader>
            <CardTitle>IBM Plex Sans</CardTitle>
            <CardDescription>Technical, geometric typeface for professional appearance</CardDescription>
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
            <CardTitle>Component Usage</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-xs text-muted-foreground mb-2'>Basic usage:</p>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-xs'>{`import { Typography } from '@/shared/components/typography'

<Typography variant="h1">Heading</Typography>
<Typography variant="p">Paragraph text</Typography>
<Typography variant="muted">Secondary info</Typography>`}</code>
              </pre>
            </div>
            <div>
              <p className='text-xs text-muted-foreground mb-2'>Custom HTML tag:</p>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-xs'>{`<Typography variant="large" as="span">
  Span with large styles
</Typography>`}</code>
              </pre>
            </div>
            <div>
              <p className='text-xs text-muted-foreground mb-2'>With additional classes:</p>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-xs'>{`<Typography variant="p" className="text-center max-w-lg">
  Centered paragraph with max width
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
