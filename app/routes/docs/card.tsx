import { BellRing, Check } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/shared/components/card'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/card'

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const CardPage = () => {
  const notifications = [
    {
      title: 'New feature released',
      description: '2 hours ago'
    },
    {
      title: 'System update completed',
      description: '1 day ago'
    },
    {
      title: 'New comment on your post',
      description: '3 days ago'
    }
  ]

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <Typography variant='h1'>Card</Typography>
        <Typography variant='lead'>
          Container component for grouping related content with optional header and footer.
        </Typography>
      </div>

      <section className='space-y-4'>
        <div>
          <Typography variant='h2'>Basic</Typography>
          <p className='text-xs text-muted-foreground'>Simple card with header and content</p>
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Brief card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant='p'>Main card content area for your information.</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>With Footer</CardTitle>
              <CardDescription>Card with action buttons in footer</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant='p'>Card content with actions below.</Typography>
            </CardContent>
            <CardFooter className='flex justify-between'>
              <Button variant='outline'>Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className='space-y-4 pt-4 border-t'>
        <div>
          <Typography variant='h2'>Notifications</Typography>
          <p className='text-xs text-muted-foreground'>
            Card with notification list and actions
          </p>
        </div>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread notifications</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div className='flex items-center space-x-4 rounded-md border p-4'>
              <BellRing />
              <div className='flex-1 space-y-1'>
                <Typography variant='small'>Push Notifications</Typography>
                <p className='text-xs text-muted-foreground'>Send notifications to device</p>
              </div>
            </div>
            <div>
              {notifications.map(notification => (
                <div
                  key={notification.title}
                  className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'
                >
                  <span className='flex h-2 w-2 translate-y-1 rounded-full bg-primary' />
                  <div className='space-y-1'>
                    <Typography variant='small'>{notification.title}</Typography>
                    <p className='text-xs text-muted-foreground'>{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full'>
              <Check className='mr-2 h-4 w-4' /> Mark all as read
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className='space-y-4 pt-4 border-t'>
        <div>
          <Typography variant='h2'>With Status</Typography>
          <p className='text-xs text-muted-foreground'>Cards with status badges</p>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Active</CardTitle>
                <Badge>Active</Badge>
              </div>
              <CardDescription>Currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>Project is under active development.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Paused</CardTitle>
                <Badge variant='secondary'>Paused</Badge>
              </div>
              <CardDescription>Temporarily on hold</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>Work has been temporarily suspended.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Completed</CardTitle>
                <Badge variant='outline'>Completed</Badge>
              </div>
              <CardDescription>Successfully finished</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>Project has been completed.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='space-y-4 pt-4 border-t'>
        <Typography variant='h2'>Usage</Typography>
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-xs text-muted-foreground mb-2'>Basic structure:</p>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-xs'>{`import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='space-y-4 pt-4 border-t'>
        <Typography variant='h2'>API Reference</Typography>
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Typography variant='large' className='mb-2'>
                Card
              </Typography>
              <p className='text-xs text-muted-foreground'>Root container component</p>
            </div>
            <div>
              <Typography variant='large' className='mb-2'>
                CardHeader
              </Typography>
              <p className='text-xs text-muted-foreground'>Header section with title and description</p>
            </div>
            <div>
              <Typography variant='large' className='mb-2'>
                CardTitle
              </Typography>
              <p className='text-xs text-muted-foreground'>Card heading text</p>
            </div>
            <div>
              <Typography variant='large' className='mb-2'>
                CardDescription
              </Typography>
              <p className='text-xs text-muted-foreground'>Muted description text below title</p>
            </div>
            <div>
              <Typography variant='large' className='mb-2'>
                CardContent
              </Typography>
              <p className='text-xs text-muted-foreground'>Main content area</p>
            </div>
            <div>
              <Typography variant='large' className='mb-2'>
                CardFooter
              </Typography>
              <p className='text-xs text-muted-foreground'>Footer section for actions</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default CardPage
