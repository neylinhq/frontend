import { ThemeToggle } from '@/app/theme'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

export const UiShowcasePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10 space-y-12 px-4 md:px-6">
        <Header />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ButtonsSection />
          <BadgesSection />
          <InputsSection />
          <FormElementsSection />
          <SelectsSection />
          <DialogsSection />
          <CardsSection />
        </div>
      </div>
    </div>
  )
}

const Header = () => (
  <div className="flex items-center justify-between border-b pb-6">
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">UI Showcase</h1>
      <p className="text-muted-foreground text-lg">
        A collection of reusable components built with Radix UI and Tailwind CSS.
      </p>
    </div>
    <ThemeToggle />
  </div>
)

const ButtonsSection = () => {
  const VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const
  const SIZES = ['sm', 'lg', 'icon'] as const

  return (
    <Section title="Buttons" className="md:col-span-2 lg:col-span-3">
      <div className="flex flex-wrap gap-4">
        {VARIANTS.map(variant => (
          <Button key={variant} variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ))}
        <div className="w-full" /> {/* Break row */}
        {SIZES.map(size => (
          <Button key={size} size={size}>
            {size === 'icon' ? '🔍' : size.toUpperCase()}
          </Button>
        ))}
      </div>
    </Section>
  )
}

const BadgesSection = () => {
  const VARIANTS = ['default', 'secondary', 'destructive', 'outline'] as const

  return (
    <Section title="Badges">
      <div className="flex flex-wrap gap-4">
        {VARIANTS.map(variant => (
          <Badge key={variant} variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Badge>
        ))}
      </div>
    </Section>
  )
}

const InputsSection = () => (
  <Section title="Inputs">
    <div className="grid w-full items-center gap-4">
      <InputWithLabel
        id="email"
        label="Email address"
        type="email"
        placeholder="name@example.com"
      />
      <InputWithLabel id="username" label="Username" placeholder="@username" />
    </div>
  </Section>
)

const FormElementsSection = () => (
  <Section title="Form Controls">
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Notify me about...</Label>
        <RadioGroup defaultValue="all">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="r1" />
            <Label htmlFor="r1">All new messages</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mentions" id="r2" />
            <Label htmlFor="r2">Direct messages and mentions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="r3" />
            <Label htmlFor="r3">Nothing</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  </Section>
)

const SelectsSection = () => (
  <Section title="Selects & Textarea">
    <div className="grid w-full gap-4">
      <div className="space-y-2">
        <Label>Select framework</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea placeholder="Type your message here." id="message" />
      </div>
    </div>
  </Section>
)

const DialogsSection = () => (
  <Section title="Dialogs">
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Section>
)

const CardsSection = () => (
  <Section title="Cards">
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Push Notifications</p>
            <p className="text-sm text-muted-foreground">Send notifications to device.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Mark all as read</Button>
      </CardFooter>
    </Card>
  </Section>
)

// --- Helpers ---

const Section = ({
  title,
  children,
  className
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <Card className={`h-full flex flex-col ${className || ''}`}>
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-1 grid content-start">{children}</CardContent>
  </Card>
)

const InputWithLabel = ({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) => (
  <div className="grid w-full items-center gap-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...props} />
  </div>
)
