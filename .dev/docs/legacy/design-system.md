# Neylin Design System

## Philosophy

### 1. Minimalism & Clarity

- No unnecessary decorative elements
- Function over form
- Every element must have a purpose
- White space is a feature, not empty space

### 2. Restraint

- Brand color only on primary actions (buttons, links)
- Minimal animations — only functional transitions
- Subtle feedback instead of flashy effects
- No gradients on backgrounds (except specific brand elements)

### 3. Consistency through Design Tokens

- Unified color system via CSS variables
- Standard spacing via Tailwind
- Typography from system (`--font-sans`)
- Consistent border radius and shadows

### 4. Accessibility First

- Contrast meets WCAG guidelines
- All interactive elements keyboard accessible
- Screen reader friendly
- Focus states always visible

---

## Colors

### Backgrounds

- `bg-background` — page background
- `bg-card` — card/section background
- `bg-muted` — subtle emphasis background

### Text

- `text-foreground` — primary text
- `text-muted-foreground` — secondary/helper text

### Borders

- `border-border` — default borders
- `border-input` — form input borders

### Brand

- Used ONLY on primary action buttons
- Never as backgrounds or decorations
- Accessible contrast with white text

---

## Spacing

### Containers

```
max-w-5xl mx-auto px-6    — standard page container
max-w-3xl                 — content/form container
max-w-sm                  — auth forms
```

### Sections

```
py-24    — large sections (landing)
py-16    — medium sections
py-10    — compact sections
py-6     — footer, small sections
```

### Cards & Components

```
p-6      — card padding
gap-6    — grid/flex gap between cards
gap-4    — internal component gaps
gap-2    — tight spacing (form fields)
```

---

## Typography

### Headings

```
text-4xl md:text-5xl font-bold tracking-tight    — hero
text-2xl font-bold                               — section title
text-lg font-semibold                            — card title
text-base font-medium                            — subsection
```

### Body

```
text-base                     — default body
text-sm text-muted-foreground — helper text, labels
text-xs text-muted-foreground — captions, metadata
```

### Rules

- No monospace for UI text (only code blocks)
- No uppercase text (except badges/labels)
- Line height: default Tailwind values

---

## Components

### Buttons

```tsx
// Primary action
<Button>Get Started</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost (navigation, menus)
<Button variant="ghost">Settings</Button>
```

### Cards

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Forms

```tsx
<Form>
  <FormField>
    <FormLabel>Label</FormLabel>
    <FormControl>
      <Input placeholder="..." />
    </FormControl>
    <FormMessage />
  </FormField>
</Form>
```

---

## Interactivity

### Hover States

```
hover:shadow-sm           — cards, clickable areas
hover:border-border/80    — subtle border change
hover:bg-accent           — menu items
hover:text-accent-foreground
```

### Transitions

```
transition-colors         — color changes
transition-shadow         — shadow changes
duration-200             — default duration
```

### Focus

- Always visible focus ring
- Use `focus-visible:` for keyboard-only focus
- Default Tailwind focus styles

---

## Layout Patterns

### Page Layout

```tsx
<div className="min-h-screen flex flex-col">
  <Header className="h-14 border-b" />
  <main className="flex-1">{children}</main>
  <Footer className="border-t py-6" />
</div>
```

### Settings/Dashboard

```tsx
<div className="container max-w-6xl mx-auto py-10 px-4">
  <aside className="w-64">{/* nav */}</aside>
  <main className="flex-1 max-w-3xl">{children}</main>
</div>
```

### Auth Pages

```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="w-full max-w-sm">{/* form */}</div>
</div>
```

---

## Anti-Patterns

### DO NOT USE

- Glitch/distortion effects
- 3D transforms for decoration
- Gradients on backgrounds
- Emojis in UI
- Backdrop blur (performance issues)
- Fake testimonials, manifesto-style text
- "AI slop" decorative elements
- Excessive animations
- Full-viewport hero sections

### AVOID

- Over-engineering simple components
- Adding features not requested
- Inconsistent spacing
- Multiple shades of gray (use tokens)
- Custom colors outside the system

---

## Quick Reference

| Element       | Class                                           |
| ------------- | ----------------------------------------------- |
| Page bg       | `bg-background`                                 |
| Card          | `bg-card border rounded-lg p-6`                 |
| Muted text    | `text-sm text-muted-foreground`                 |
| Container     | `max-w-5xl mx-auto px-6`                        |
| Section       | `py-24` or `py-16`                              |
| Card gap      | `gap-6`                                         |
| Heading       | `font-bold tracking-tight`                      |
| Hover card    | `hover:shadow-sm transition-shadow`             |
| Transition    | `transition-colors duration-200`                |
| Border subtle | `border-border`                                 |
| Primary btn   | `<Button>` (brand color)                        |
| Ghost btn     | `<Button variant="ghost">`                      |
