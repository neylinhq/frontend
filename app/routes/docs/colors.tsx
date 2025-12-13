import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/colors'

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Color Data
 * ───────────────────────────────────────────────────────────────────────────── */

type ColorItem = { name: string; var: string; desc: string }

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
    description: 'Базовые семантические цвета UI — адаптируются к теме и палитре',
    colors: [
      { name: 'Background', var: '--background', desc: 'Основной фон' },
      { name: 'Foreground', var: '--foreground', desc: 'Основной текст' },
      { name: 'Card', var: '--card', desc: 'Фон карточек' },
      { name: 'Popover', var: '--popover', desc: 'Фон поповеров' },
      { name: 'Primary', var: '--primary', desc: 'Основной акцент' },
      { name: 'Secondary', var: '--secondary', desc: 'Вторичный цвет' },
      { name: 'Muted', var: '--muted', desc: 'Приглушенный фон' },
      { name: 'Accent', var: '--accent', desc: 'Акцентный фон' },
      { name: 'Destructive', var: '--destructive', desc: 'Ошибки/удаление' },
      { name: 'Success', var: '--success', desc: 'Успех' },
      { name: 'Warning', var: '--warning', desc: 'Предупреждение' },
      { name: 'Info', var: '--info', desc: 'Информация' },
      { name: 'Border', var: '--border', desc: 'Границы' },
      { name: 'Ring', var: '--ring', desc: 'Focus ring' }
    ]
  },
  {
    id: 'brand',
    title: 'Brand Colors',
    description: 'Фирменные цвета — меняются в зависимости от палитры',
    colors: [
      { name: 'Brand', var: '--brand', desc: 'Фирменный цвет' },
      { name: 'Brand Muted', var: '--brand-muted', desc: 'Приглушенный brand' }
    ]
  },
  {
    id: 'graph',
    title: 'Graph Colors',
    description: '6 базовых цветов для элементов графа',
    colors: [
      { name: 'Violet', var: '--graph-violet', desc: 'Фиолетовый' },
      { name: 'Blue', var: '--graph-blue', desc: 'Синий' },
      { name: 'Cyan', var: '--graph-cyan', desc: 'Голубой' },
      { name: 'Emerald', var: '--graph-emerald', desc: 'Изумрудный' },
      { name: 'Amber', var: '--graph-amber', desc: 'Янтарный' },
      { name: 'Rose', var: '--graph-rose', desc: 'Розовый' }
    ]
  },
  {
    id: 'node-semantic',
    title: 'Node Semantic Colors',
    description: 'S+ Elite — 6 цветов для типов нод в графе знаний',
    colors: [
      { name: 'Knowledge', var: '--semantic-knowledge', desc: 'Синий — concept, theory' },
      { name: 'Fact', var: '--semantic-fact', desc: 'Зелёный — fact' },
      { name: 'Question', var: '--semantic-question', desc: 'Фиолетовый — question, hypothesis' },
      { name: 'Example', var: '--semantic-example', desc: 'Янтарный — example, person, school' },
      { name: 'Conflict', var: '--semantic-conflict', desc: 'Красный — противоречия' },
      { name: 'Neutral', var: '--semantic-neutral', desc: 'Серый — нейтральный' }
    ]
  },
  {
    id: 'complexity',
    title: 'Complexity Colors',
    description: '3 уровня сложности контента',
    colors: [
      { name: 'Basic', var: '--complexity-basic', desc: 'Серый — базовый' },
      { name: 'Intermediate', var: '--complexity-intermediate', desc: 'Синий — средний' },
      { name: 'Advanced', var: '--complexity-advanced', desc: 'Красный — продвинутый' }
    ]
  },
  {
    id: 'edge',
    title: 'Edge Colors',
    description: '10 уникальных цветов для типов связей между нодами',
    columns: 4,
    colors: [
      { name: 'Prerequisite', var: '--edge-prerequisite', desc: 'Оранжевый — зависимость' },
      { name: 'Causes', var: '--edge-causes', desc: 'Красный — причина' },
      { name: 'Explains', var: '--edge-explains', desc: 'Фиолетовый — объяснение' },
      { name: 'Is-A', var: '--edge-is-a', desc: 'Индиго — таксономия' },
      { name: 'Has-A', var: '--edge-has-a', desc: 'Изумрудный — композиция' },
      { name: 'Part-Of', var: '--edge-part-of', desc: 'Бирюзовый — агрегация' },
      { name: 'Influences', var: '--edge-influences', desc: 'Янтарный — влияние' },
      { name: 'Related-To', var: '--edge-related-to', desc: 'Серый — слабая связь' },
      { name: 'Contradicts', var: '--edge-contradicts', desc: 'Тёмно-красный — противоречие' },
      { name: 'Similar-To', var: '--edge-similar-to', desc: 'Лаймовый — сходство' }
    ]
  }
]

/* ─────────────────────────────────────────────────────────────────────────────
 * Components
 * ───────────────────────────────────────────────────────────────────────────── */

const ColorCard = ({ name, var: cssVar, desc }: ColorItem) => (
  <Card>
    <CardHeader className='pb-3'>
      <div
        className='h-16 border-b mb-3 -mx-6 -mt-6'
        style={{ backgroundColor: `oklch(var(${cssVar}))` }}
      />
      <CardTitle className='text-base'>{name}</CardTitle>
      <CardDescription>
        <code className='text-xs'>{cssVar}</code>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Typography variant='small' className='text-muted-foreground'>
        {desc}
      </Typography>
    </CardContent>
  </Card>
)

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
      <div>
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
        <CardTitle>Использование в коде</CardTitle>
        <CardDescription>Примеры использования CSS переменных</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Typography variant='small' className='mb-2'>
            Tailwind CSS:
          </Typography>
          <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
            <code className='text-sm'>{`<div className="bg-primary text-primary-foreground">
  Primary content
</div>`}</code>
          </pre>
        </div>
        <div>
          <Typography variant='small' className='mb-2'>
            Inline CSS:
          </Typography>
          <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
            <code className='text-sm'>{`<div style={{ color: 'oklch(var(--primary))' }}>
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
        Система цветов адаптируется к палитре (Classic/Vanilla/Vivid/Mono) и теме (Light/Dark)
      </Typography>
    </div>

    {COLOR_SECTIONS.map((section, index) => (
      <ColorSection key={section.id} {...section} isFirst={index === 0} />
    ))}

    <UsageSection />
  </div>
)

export default ColorsPage
