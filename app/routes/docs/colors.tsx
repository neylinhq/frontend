import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { DocsSectionHeader } from '@/shared/components/docs-section-header'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/colors'

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Color Data
 * ───────────────────────────────────────────────────────────────────────────── */

type ColorItem = { name: string; var: string; desc: string; isRaw?: boolean }

type ColorSectionData = {
  id: string
  title: string
  description: string
  colors: ColorItem[]
  columns?: 2 | 3 | 4
}

const COLOR_SECTIONS: ColorSectionData[] = [
  {
    id: 'semantic',
    title: 'Semantic Colors',
    description: 'Core UI colors that adapt to theme and palette',
    colors: [
      { name: 'Background', var: '--background', desc: 'Main background' },
      { name: 'Foreground', var: '--foreground', desc: 'Primary text' },
      { name: 'Card', var: '--card', desc: 'Card backgrounds' },
      { name: 'Popover', var: '--popover', desc: 'Popover backgrounds' },
      { name: 'Primary', var: '--primary', desc: 'Primary accent' },
      { name: 'Secondary', var: '--secondary', desc: 'Secondary color' },
      { name: 'Muted', var: '--muted', desc: 'Muted backgrounds' },
      { name: 'Accent', var: '--accent', desc: 'Accent backgrounds' },
      { name: 'Destructive', var: '--destructive', desc: 'Errors & deletion' },
      { name: 'Success', var: '--success', desc: 'Success states' },
      { name: 'Warning', var: '--warning', desc: 'Warning states' },
      { name: 'Info', var: '--info', desc: 'Information' },
      { name: 'Border', var: '--border', desc: 'Borders' },
      { name: 'Input', var: '--input', desc: 'Input borders' },
      { name: 'Ring', var: '--ring', desc: 'Focus rings' }
    ]
  },
  {
    id: 'brand',
    title: 'Brand Colors',
    description: 'Brand colors that change with palette',
    colors: [
      { name: 'Brand', var: '--brand', desc: 'Brand color' },
      { name: 'Brand Muted', var: '--brand-muted', desc: 'Muted brand' }
    ]
  },
  {
    id: 'node-types',
    title: 'Node Type Colors',
    description: '8 unique colors for knowledge graph node types',
    columns: 4,
    colors: [
      { name: 'Concept', var: '--node-concept', desc: 'H=240 abstract knowledge' },
      { name: 'Theory', var: '--node-theory', desc: 'H=265 deep theory' },
      { name: 'Fact', var: '--node-fact', desc: 'H=145 verified info' },
      { name: 'Example', var: '--node-example', desc: 'H=55 practical example' },
      { name: 'Question', var: '--node-question', desc: 'H=290 unknown' },
      { name: 'Hypothesis', var: '--node-hypothesis', desc: 'H=315 hypothesis' },
      { name: 'Person', var: '--node-person', desc: 'H=25 person' },
      { name: 'School', var: '--node-school', desc: 'H=195 institution' }
    ]
  },
  {
    id: 'complexity',
    title: 'Complexity Colors',
    description: '3 content complexity levels',
    colors: [
      { name: 'Basic', var: '--complexity-basic', desc: 'Gray - basic' },
      { name: 'Intermediate', var: '--complexity-intermediate', desc: 'Blue - intermediate' },
      { name: 'Advanced', var: '--complexity-advanced', desc: 'Red - advanced' }
    ]
  },
  {
    id: 'edge',
    title: 'Edge Colors',
    description: '10 unique colors for node relationship types',
    columns: 4,
    colors: [
      { name: 'Prerequisite', var: '--edge-prerequisite', desc: 'Orange - dependency' },
      { name: 'Causes', var: '--edge-causes', desc: 'Red - causation' },
      { name: 'Explains', var: '--edge-explains', desc: 'Purple - explanation' },
      { name: 'Is-A', var: '--edge-is-a', desc: 'Indigo - taxonomy' },
      { name: 'Has-A', var: '--edge-has-a', desc: 'Emerald - composition' },
      { name: 'Part-Of', var: '--edge-part-of', desc: 'Teal - aggregation' },
      { name: 'Influences', var: '--edge-influences', desc: 'Amber - influence' },
      { name: 'Related-To', var: '--edge-related-to', desc: 'Blue - weak link' },
      { name: 'Contradicts', var: '--edge-contradicts', desc: 'Dark red - contradiction' },
      { name: 'Similar-To', var: '--edge-similar-to', desc: 'Lime - similarity' }
    ]
  },
  {
    id: 'rating',
    title: 'Rating Colors',
    description: 'Tier colors for gamification and ratings',
    columns: 4,
    colors: [
      { name: 'Novice', var: '--rating-novice', desc: 'Neutral - starting tier' },
      { name: 'Apprentice', var: '--rating-apprentice', desc: 'Blue - learning' },
      { name: 'Journeyman', var: '--rating-journeyman', desc: 'Green - progress' },
      { name: 'Expert', var: '--rating-expert', desc: 'Yellow - competent' },
      { name: 'Master', var: '--rating-master', desc: 'Orange - skilled' },
      { name: 'Grandmaster', var: '--rating-grandmaster', desc: 'Red - elite' },
      { name: 'Legend', var: '--rating-legend', desc: 'Purple - exceptional' },
      { name: 'Mythic', var: '--rating-mythic', desc: 'Pink - legendary' }
    ]
  },
  {
    id: 'editor-text',
    title: 'Editor Text Colors',
    description: 'Inline text colors for rich text editor',
    columns: 3,
    colors: [
      { name: 'Gray', var: '--editor-text-gray', desc: 'Neutral text' },
      { name: 'Brown', var: '--editor-text-brown', desc: 'Warm emphasis' },
      { name: 'Orange', var: '--editor-text-orange', desc: 'Highlight text' },
      { name: 'Yellow', var: '--editor-text-yellow', desc: 'Attention text' },
      { name: 'Green', var: '--editor-text-green', desc: 'Positive text' },
      { name: 'Blue', var: '--editor-text-blue', desc: 'Informative text' },
      { name: 'Purple', var: '--editor-text-purple', desc: 'Conceptual text' },
      { name: 'Pink', var: '--editor-text-pink', desc: 'Emphasis text' },
      { name: 'Red', var: '--editor-text-red', desc: 'Critical text' }
    ]
  },
  {
    id: 'editor-highlight',
    title: 'Editor Highlight Colors',
    description: 'Background tints for editor highlights',
    columns: 4,
    colors: [
      { name: 'Gray', var: '--editor-highlight-gray', desc: 'Neutral highlight' },
      { name: 'Yellow', var: '--editor-highlight-yellow', desc: 'Attention highlight' },
      { name: 'Green', var: '--editor-highlight-green', desc: 'Positive highlight' },
      { name: 'Blue', var: '--editor-highlight-blue', desc: 'Informative highlight' },
      { name: 'Purple', var: '--editor-highlight-purple', desc: 'Conceptual highlight' },
      { name: 'Pink', var: '--editor-highlight-pink', desc: 'Emphasis highlight' },
      { name: 'Orange', var: '--editor-highlight-orange', desc: 'Warm highlight' },
      { name: 'Red', var: '--editor-highlight-red', desc: 'Critical highlight' }
    ]
  },
  {
    id: 'syntax',
    title: 'Syntax Highlighting Colors',
    description: 'Code block syntax colors',
    columns: 4,
    colors: [
      { name: 'Keyword', var: '--syntax-keyword', desc: 'Keywords' },
      { name: 'String', var: '--syntax-string', desc: 'Strings' },
      { name: 'Number', var: '--syntax-number', desc: 'Numbers' },
      { name: 'Comment', var: '--syntax-comment', desc: 'Comments' },
      { name: 'Function', var: '--syntax-function', desc: 'Functions' },
      { name: 'Variable', var: '--syntax-variable', desc: 'Variables' },
      { name: 'Type', var: '--syntax-type', desc: 'Types' },
      { name: 'Operator', var: '--syntax-operator', desc: 'Operators' },
      { name: 'Property', var: '--syntax-property', desc: 'Properties' },
      { name: 'Punctuation', var: '--syntax-punctuation', desc: 'Punctuation' }
    ]
  },
  {
    id: 'utility',
    title: 'Utility Colors',
    description: 'Overlays and system accents',
    columns: 3,
    colors: [
      { name: 'Surface Hover', var: '--surface-hover', desc: 'Hover surface fill', isRaw: true },
      { name: 'Overlay', var: '--overlay', desc: 'Modal scrim' },
      { name: 'Overlay Light', var: '--overlay-light', desc: 'Light scrim' },
      { name: 'Canvas Grid', var: '--canvas-grid', desc: 'Graph grid' },
      { name: 'Confidence High', var: '--confidence-high', desc: 'High confidence' },
      { name: 'Confidence Low', var: '--confidence-low', desc: 'Low confidence' }
    ]
  }
]

/* ─────────────────────────────────────────────────────────────────────────────
 * Components
 * ───────────────────────────────────────────────────────────────────────────── */

const ColorCard = ({ name, var: cssVar, desc, isRaw }: ColorItem) => {
  const backgroundColor = isRaw ? `var(${cssVar})` : `oklch(var(${cssVar}))`

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='h-16 border-b mb-3 -mx-6 -mt-6' style={{ backgroundColor }} />
        <CardTitle className='text-sm'>{name}</CardTitle>
        <CardDescription className='text-xs'>
          <code>{cssVar}</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-xs text-muted-foreground'>{desc}</p>
      </CardContent>
    </Card>
  )
}

const ColorSection = ({
  title,
  description,
  colors,
  columns = 3,
  isFirst = false
}: ColorSectionData & { isFirst?: boolean }) => {
  const gridCols = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4'
  }[columns]

  return (
    <section className={`space-y-4 ${isFirst ? '' : 'pt-4 border-t'}`}>
      <div className='space-y-2'>
        <Typography variant='h2'>{title}</Typography>
        <Typography variant='muted'>{description}</Typography>
      </div>
      <div className={`grid gap-3 sm:grid-cols-2 ${gridCols}`}>
        {colors.map(color => (
          <ColorCard key={color.var} {...color} />
        ))}
      </div>
    </section>
  )
}

const UsageSection = () => (
  <section className='space-y-4 pt-4 border-t'>
    <Typography variant='h2'>Usage</Typography>
    <Card>
      <CardHeader>
        <CardTitle>Code Usage</CardTitle>
        <CardDescription>CSS variable usage examples</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-xs text-muted-foreground mb-2'>Tailwind CSS:</p>
          <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
            <code className='text-xs'>{`<div className="bg-primary text-primary-foreground">
  Primary content
</div>`}</code>
          </pre>
        </div>
        <div>
          <p className='text-xs text-muted-foreground mb-2'>Inline CSS:</p>
          <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
            <code className='text-xs'>{`<div style={{ color: 'oklch(var(--primary))' }}>
  Custom color
</div>`}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  </section>
)

/* ─────────────────────────────────────────────────────────────────────────────
 * Page
 * ───────────────────────────────────────────────────────────────────────────── */

const ColorsPage = () => (
  <div className='space-y-8'>
    <div className='space-y-3'>
      <Typography variant='h1'>Colors</Typography>
      <Typography variant='lead'>
        Color system adapts to palette (Classic/Vanilla/Vivid/Mono) and theme (Light/Dark)
      </Typography>
    </div>

    {COLOR_SECTIONS.map((section, index) => (
      <ColorSection key={section.id} {...section} isFirst={index === 0} />
    ))}

    <UsageSection />
  </div>
)

export default ColorsPage
