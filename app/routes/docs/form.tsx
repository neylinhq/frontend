import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Checkbox } from '@/shared/components/checkbox'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/form'

export const handle = {
  breadcrumb: 'Form'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const FormPage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: 'Basic', level: 2 },
    { id: 'with-validation', title: 'With Validation', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 }
  ]

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Form' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Form</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Form components with validation using React Hook Form and Zod.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <p className='text-xs text-muted-foreground'>Simple login form example</p>
          <DocsComponentPreview
            code={`<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="email@example.com" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" />
  </div>
  <div className="flex items-center space-x-2">
    <Checkbox id="remember" />
    <Label htmlFor="remember">Remember me</Label>
  </div>
  <Button type="submit" className="w-full">Sign In</Button>
</form>`}
          >
            <DocsPreview>
              <form className='space-y-4 w-full max-w-sm'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' placeholder='email@example.com' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input id='password' type='password' />
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox id='remember' />
                  <Label htmlFor='remember'>Remember me</Label>
                </div>
                <Button type='submit' className='w-full'>
                  Sign In
                </Button>
              </form>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='with-validation' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>With Validation</Typography>
          <p className='text-xs text-muted-foreground'>Form field with error state</p>
          <DocsComponentPreview
            code={`<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    className="border-destructive"
    aria-invalid="true"
  />
  <p className="text-sm text-destructive">
    Please enter a valid email address
  </p>
</div>`}
          >
            <DocsPreview>
              <div className='space-y-2 w-full max-w-sm'>
                <Label htmlFor='email-error'>Email</Label>
                <Input
                  id='email-error'
                  type='email'
                  className='border-destructive focus-visible:ring-destructive'
                  defaultValue='invalid-email'
                />
                <p className='text-sm text-destructive'>Please enter a valid email address</p>
              </div>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>
          <p className='text-xs text-muted-foreground mb-4'>
            Form validation with React Hook Form and Zod
          </p>
          <DocsCodeBlock
            language='tsx'
            code={`import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/form'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  )
}`}
          />
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default FormPage
