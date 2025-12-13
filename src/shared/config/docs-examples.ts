/**
 * Demo data and examples for documentation pages
 */

// Button examples
export const BUTTON_VARIANTS = [
  { variant: 'default' as const, label: 'Default' },
  { variant: 'brand' as const, label: 'Brand' },
  { variant: 'secondary' as const, label: 'Secondary' },
  { variant: 'destructive' as const, label: 'Destructive' },
  { variant: 'outline' as const, label: 'Outline' },
  { variant: 'ghost' as const, label: 'Ghost' },
  { variant: 'link' as const, label: 'Link' }
] as const

export const BUTTON_SIZES = [
  { size: 'sm' as const, label: 'Small', content: 'Small' },
  { size: 'default' as const, label: 'Default', content: 'Default' },
  { size: 'lg' as const, label: 'Large', content: 'Large' },
  { size: 'icon' as const, label: 'Icon', content: null }
] as const

// Badge examples
export const BADGE_VARIANTS = [
  { variant: 'default' as const, label: 'Default' },
  { variant: 'secondary' as const, label: 'Secondary' },
  { variant: 'destructive' as const, label: 'Destructive' },
  { variant: 'outline' as const, label: 'Outline' },
  { variant: 'brand' as const, label: 'Brand' },
  { variant: 'success' as const, label: 'Success' },
  { variant: 'warning' as const, label: 'Warning' },
  { variant: 'info' as const, label: 'Info' }
] as const

// Typography examples
export const TYPOGRAPHY_EXAMPLES = [
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
] as const

// Demo data for examples
export const DEMO_INVOICES = [
  { invoice: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { invoice: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { invoice: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' }
] as const

export const DEMO_NOTIFICATIONS = [
  { title: 'New feature released', description: '2 hours ago' },
  { title: 'System update completed', description: '1 day ago' },
  { title: 'New comment on your post', description: '3 days ago' }
] as const

export const DEMO_CARD_STATUSES = [
  { status: 'Active', description: 'Currently running' },
  { status: 'Paused', description: 'Temporarily stopped' },
  { status: 'Completed', description: 'Finished successfully' }
] as const
