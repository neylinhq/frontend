import { Button } from '@/shared/components/button'
import { Checkbox } from '@/shared/components/checkbox'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/form'

export const handle = {
  breadcrumb: 'Form'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'with-validation', title: 'With Validation', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const FormPage = () => {
  return (
    <DocsPageLayout
      title='Form'
      description='Form components with validation using React Hook Form and Zod.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Simple login form example'>
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
      </DocsSection>

      <DocsSection id='with-validation' title='With Validation' description='Form field with error state'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
    // handle submit
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
      </DocsSection>
    </DocsPageLayout>
  )
}

export default FormPage
