# Design Manifesto

This document describes the fundamental design philosophy of our application. It is not a component library or style guide—it is a declaration of principles that guide every design decision we make.

---

## Core Philosophy

Great design disappears. The interface should recede, allowing content to take center stage. We believe in **structural minimalism** for the tools we build, and **visual expressiveness** for the content users create.

### Our Principles

**1. Clarity over Cleverness**

Every element serves a purpose. Decoration without function is noise. We choose straightforward solutions over impressive complexity. Users should never need to decode our interface—clarity is respect for their time and attention.

**2. Interface Disappears, Content Shines**

The application chrome—navigation, toolbars, forms—should be restrained and neutral. It's infrastructure, not the destination. The content canvas—where users think, create, and explore—should be vibrant and expressive. This separation creates focus.

**3. Function Drives Form**

Visual decisions emerge from functional requirements. An element's appearance should communicate its purpose and state. Beauty without utility is distraction; utility without beauty is coldness. We seek the intersection.

**4. Accessibility is Foundation**

Accessible design isn't a checklist—it's a mindset. Keyboard navigation, contrast ratios, semantic HTML, and screen reader support aren't afterthoughts. They improve the experience for everyone and expand who can use our tools.

---

## Visual Language

### Color Philosophy

Color is information. It creates hierarchy, signals relationships, and guides attention. Used carelessly, it creates chaos. Used deliberately, it becomes invisible infrastructure.

**Interface Layer: Restrained**

The application shell uses a neutral, monochromatic palette. Backgrounds fade to white or near-black. Text maintains high contrast for readability. Borders are subtle. Interactive elements use muted tones except for primary actions.

Why? Because the interface isn't the point. It's the stage, not the performance.

**Content Layer: Expressive**

The working canvas—graphs, nodes, data visualizations—embraces vibrant color. Each node type, relationship, or data category can claim distinct, saturated hues. Color becomes a navigation aid, a mnemonic device, a way to parse complexity at a glance.

Why? Because content is what users came for. Color helps them understand it faster.

**Principles:**

- **Neutral as Default**: Start with no color. Add it only where it serves comprehension or interaction.
- **Color as Hierarchy**: Use saturation and hue to distinguish importance and relationships.
- **Contrast is Non-Negotiable**: All text must meet WCAG AA standards (4.5:1 for body, 3:1 for large text).
- **Consistency Creates Trust**: Once a color represents something, it always represents that thing.

---

## Space & Rhythm

### The Role of White Space

White space isn't emptiness—it's breathing room. Cramped layouts create anxiety. Generous spacing creates calm and focus. Every element should have space to exist without crowding its neighbors.

**Principles:**

- **Rhythm Through Consistency**: Use a harmonic scale for spacing. Related elements share rhythm; distinct elements break it.
- **Density Serves Purpose**: Dense layouts for data-heavy views; spacious layouts for focused tasks.
- **Responsive Breathing**: Spacing should adapt to viewport size, maintaining proportional rhythm rather than fixed values.
- **Progressive Disclosure**: Use space to reveal structure—closer items are related, distant items are separate.

### Grid as Invisible Guide

Grids create alignment and predictability. Users don't see the grid, but they feel its absence. Alignment signals intentionality. Misalignment signals carelessness or chaos.

Grids aren't rigid—they're guides. Break them when it serves clarity, but break them deliberately, not accidentally.

---

## Typography as Hierarchy

### Information Architecture Through Type

Typography doesn't just make text readable—it makes information parseable. Scale, weight, and spacing create visual hierarchy that mirrors content hierarchy.

**Principles:**

- **Fewer Weights, Stronger Hierarchy**: Limit typeface weights to 2-3. Overuse dilutes their power to distinguish.
- **Scale Creates Rhythm**: Use a typographic scale (e.g., 1.25 ratio). Consistent scale creates harmony; arbitrary sizes create discord.
- **Line Length Affects Comprehension**: 50-75 characters per line for body text. Too short breaks rhythm; too long strains tracking.
- **Line Height Balances Density**: Tighter for headings (1.2-1.3), more generous for body (1.5-1.6).
- **System Fonts for Familiarity**: Native fonts load instantly and feel familiar. Custom fonts are allowed but must justify their cost in performance and learning curve.

### Readability Over Novelty

Typography should be invisible infrastructure, not a design statement. Users came to read content, not admire font choices. Maximize legibility, minimize personality.

---

## Motion & Feedback

### When and Why to Animate

Motion should reveal relationships or provide feedback—nothing more. Animations that exist purely for aesthetic reasons are decorative noise.

**Principles:**

- **Motion Reveals Structure**: Transitions show what changed and why. Elements that appear should grow or fade in; elements that disappear should shrink or fade out.
- **Feedback for Every Interaction**: Buttons respond to clicks, inputs acknowledge typing, operations confirm completion. Silence creates doubt.
- **Performance Over Flash**: Smooth is better than elaborate. A simple 200ms fade beats a complex 500ms choreography.
- **Respect Reduced Motion**: Honor `prefers-reduced-motion`. Users who set this preference need it—respect that.

### Duration & Easing Philosophy

**Micro-interactions** (checkbox toggle, button press): 100-150ms, instant easing. Users shouldn't wait.

**Standard transitions** (hover states, color changes): 200ms, ease-in-out. Smooth but not slow.

**Entrances** (modals, drawers): 250-300ms, ease-out. Deceleration feels welcoming.

**Exits** (closing modals): 200ms, ease-in. Acceleration feels responsive.

Never auto-play animations. Never loop infinitely (except loading indicators). Animation is communication, not entertainment.

---

## Content vs Interface

This is the core tension that defines our visual philosophy. Reconciling minimalism with expressiveness requires separating where each applies.

### Interface Layer: The Chrome

**What it includes**: Navigation bars, sidebars, toolbars, forms, dialogs, settings panels—the application shell.

**How it looks**: Minimalist, restrained, neutral. Monochromatic palette. Subtle borders. Muted backgrounds. Clean typography. Invisible until needed.

**Why**: The interface is infrastructure. It should recede into the background, allowing users to focus on their work. Inspired by technical tools—precise, unobtrusive, efficient.

**Reference aesthetic**: Vercel, Linear, GitHub's interface—technical minimalism that gets out of the way.

### Content Layer: The Canvas

**What it includes**: Graph visualization, nodes, edges, data cards, user-generated content—the working area.

**How it looks**: Expressive, colorful, dynamic. Vibrant node colors. Rich data visualization. Clear visual hierarchy through saturation and contrast.

**Why**: Content is why users came. It deserves attention. Color, contrast, and visual interest help users parse complexity, remember relationships, and navigate large information spaces.

**Reference aesthetic**: Recraft, Figma, Obsidian Canvas—modern, vibrant, creativity-friendly tools that make working feel alive.

### Why This Separation Works

**Cognitive Clarity**: When the interface is quiet, the content can be loud without overwhelming users.

**Focused Attention**: Neutral chrome directs attention to the colorful canvas—users know where to look.

**Scalability**: Large graphs with many colored nodes remain parseable because they're not competing with colorful UI chrome.

**Best of Both Worlds**: Technical precision where it matters (controls, inputs) and creative expressiveness where it serves (content, visualization).

This isn't compromise—it's intentional layering. Minimalism and expressiveness coexist when each knows its place.

---

## Accessibility Fundamentals

Accessibility isn't accommodation—it's quality. Designs that work for users with disabilities work better for everyone.

### Non-Negotiable Principles

**Keyboard Navigation for Everything**: Every interactive element must be reachable and operable via keyboard. Tab order should follow visual order. Focus indicators must always be visible.

**Contrast Ratios Meet Standards**: Text on backgrounds must meet WCAG AA (4.5:1 for normal text, 3:1 for large text). Don't rely solely on color to convey information—use text labels, patterns, or icons too.

**Semantic HTML**: Use native elements when possible. Buttons are `<button>`, links are `<a>`, headings nest properly. Screen readers depend on semantic structure.

**Focus Indicators**: Never hide focus outlines globally. Style them to match your design, but ensure they're always visible for keyboard users.

### Accessibility Improves Experience for Everyone

- Keyboard shortcuts help power users, not just users who can't use mice.
- High contrast benefits users in bright sunlight, not just users with low vision.
- Clear language helps non-native speakers, not just users with cognitive disabilities.
- Captions help people in noisy environments, not just deaf users.

Design for accessibility from the start. Retrofitting is expensive and incomplete.

---

## Anti-Patterns & Design Smell

Knowing what to avoid is as important as knowing what to pursue.

### What We Avoid and Why

**Decoration Without Purpose**
Glitch effects, 3D transforms for decoration, ornamental gradients—these add visual noise without improving comprehension or usability. If removing it doesn't hurt clarity, it shouldn't be there.

**Trends Over Usability**
Design trends age poorly. Neumorphism, glassmorphism, excessive drop shadows—yesterday's cutting edge is today's dated. Timeless design outlasts trends.

**Complexity Without Need**
Every layer of abstraction, every custom component, every novel pattern introduces cognitive load. Simple solutions scale better than clever ones.

**Inconsistency**
Inconsistent spacing, colors, or interaction patterns break trust. Users internalize patterns quickly—violating them feels like a bug.

**Flashiness Over Clarity**
Excessive animations, auto-playing effects, aggressive gradients—these distract from content and signal inexperience. Confidence is quiet.

### Specific Anti-Patterns

**DO NOT USE:**
- Glitch/distortion effects (gimmicky, accessibility issues)
- Excessive animations (distraction, performance cost)
- Gradient backgrounds on UI (readability problems)
- Emojis in interface chrome (unprofessional, inconsistent rendering)
- Backdrop blur (performance issues, especially on low-end devices)
- Auto-playing animations or videos (accessibility violation, annoying)

### Design Smell Detection

When reviewing a design, ask:

- **"Is this serving the user or the designer's ego?"** — If it's showing off, remove it.
- **"Will this age well?"** — If it's chasing a trend, reconsider.
- **"Does this add clarity or complexity?"** — If complexity, justify it or simplify.
- **"Would I want to use this every day?"** — If novelty wears off quickly, it's decoration.

---

## Closing

Design is decision-making. Every choice about color, spacing, motion, or hierarchy is a decision about what matters and what doesn't.

Our philosophy is simple: **Let the interface disappear so the content can shine.** Be minimalist where it serves focus. Be expressive where it serves understanding. Be consistent to build trust. Be accessible to respect all users.

This manifesto isn't a rulebook—it's a lens. Use it to evaluate decisions. When in doubt, return to these principles. Clarity, purpose, balance, and respect will guide you to the right answer.

Build tools that get out of the way. Build canvases that invite creation. Build experiences that last.
