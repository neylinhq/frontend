import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/colors'

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

const SEMANTIC_COLORS = [
  { name: 'Background', var: '--background', desc: 'Основной фон приложения' },
  { name: 'Foreground', var: '--foreground', desc: 'Основной текст' },
  { name: 'Card', var: '--card', desc: 'Фон карточек' },
  { name: 'Card Foreground', var: '--card-foreground', desc: 'Текст в карточках' },
  { name: 'Popover', var: '--popover', desc: 'Фон поповеров' },
  { name: 'Popover Foreground', var: '--popover-foreground', desc: 'Текст в поповерах' },
  { name: 'Primary', var: '--primary', desc: 'Основной акцентный цвет' },
  { name: 'Primary Foreground', var: '--primary-foreground', desc: 'Текст на primary' },
  { name: 'Secondary', var: '--secondary', desc: 'Вторичный цвет' },
  { name: 'Secondary Foreground', var: '--secondary-foreground', desc: 'Текст на secondary' },
  { name: 'Muted', var: '--muted', desc: 'Приглушенный фон' },
  { name: 'Muted Foreground', var: '--muted-foreground', desc: 'Приглушенный текст' },
  { name: 'Accent', var: '--accent', desc: 'Акцентный фон' },
  { name: 'Accent Foreground', var: '--accent-foreground', desc: 'Текст на accent' },
  { name: 'Destructive', var: '--destructive', desc: 'Цвет для ошибок/удаления' },
  { name: 'Destructive Foreground', var: '--destructive-foreground', desc: 'Текст на destructive' },
  { name: 'Success', var: '--success', desc: 'Цвет успеха' },
  { name: 'Success Foreground', var: '--success-foreground', desc: 'Текст на success' },
  { name: 'Warning', var: '--warning', desc: 'Цвет предупреждения' },
  { name: 'Warning Foreground', var: '--warning-foreground', desc: 'Текст на warning' },
  { name: 'Info', var: '--info', desc: 'Информационный цвет' },
  { name: 'Info Foreground', var: '--info-foreground', desc: 'Текст на info' },
  { name: 'Border', var: '--border', desc: 'Цвет границ' },
  { name: 'Input', var: '--input', desc: 'Границы инпутов' },
  { name: 'Ring', var: '--ring', desc: 'Focus ring' }
]

const BRAND_COLORS = [
  { name: 'Brand', var: '--brand', desc: 'Фирменный цвет' },
  { name: 'Brand Foreground', var: '--brand-foreground', desc: 'Текст на brand' },
  { name: 'Brand Muted', var: '--brand-muted', desc: 'Приглушенный brand' }
]

const GRAPH_COLORS = [
  { name: 'Violet', var: '--graph-violet', desc: 'Фиолетовый для графа' },
  { name: 'Blue', var: '--graph-blue', desc: 'Синий для графа' },
  { name: 'Cyan', var: '--graph-cyan', desc: 'Голубой для графа' },
  { name: 'Emerald', var: '--graph-emerald', desc: 'Изумрудный для графа' },
  { name: 'Amber', var: '--graph-amber', desc: 'Янтарный для графа' },
  { name: 'Rose', var: '--graph-rose', desc: 'Розовый для графа' }
]

const ColorsPage = () => {
  const { t } = useTranslation()

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <Typography variant='h1'>{t('docs.colors.title')}</Typography>
        <Typography variant='lead'>{t('docs.colors.lead')}</Typography>
      </div>

      {/* Semantic Colors */}
      <section className='space-y-4'>
        <div>
          <Typography variant='h2'>{t('docs.colors.semantic.title')}</Typography>
          <Typography variant='muted'>{t('docs.colors.semantic.description')}</Typography>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {SEMANTIC_COLORS.map(color => (
            <ColorCard key={color.var} {...color} />
          ))}
        </div>
      </section>

      {/* Brand Colors */}
      <section className='space-y-4 pt-4 border-t'>
        <div>
          <Typography variant='h2'>{t('docs.colors.brand.title')}</Typography>
          <Typography variant='muted'>{t('docs.colors.brand.description')}</Typography>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {BRAND_COLORS.map(color => (
            <ColorCard key={color.var} {...color} />
          ))}
        </div>
      </section>

      {/* Graph Colors */}
      <section className='space-y-4 pt-4 border-t'>
        <div>
          <Typography variant='h2'>{t('docs.colors.graph.title')}</Typography>
          <Typography variant='muted'>{t('docs.colors.graph.description')}</Typography>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {GRAPH_COLORS.map(color => (
            <ColorCard key={color.var} {...color} />
          ))}
        </div>
      </section>

      {/* Usage */}
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
                <code className='text-sm'>{`<div className="bg-primary text-primary-foreground">\n  Primary content\n</div>`}</code>
              </pre>
            </div>
            <div>
              <Typography variant='small' className='mb-2'>
                Inline CSS:
              </Typography>
              <pre className='rounded-lg bg-muted p-4 overflow-x-auto'>
                <code className='text-sm'>{`<div style={{ color: 'hsl(var(--primary))' }}>\n  Custom color\n</div>`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

const ColorCard = ({ name, var: cssVar, desc }: { name: string; var: string; desc: string }) => {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div
          className='h-16 border-b mb-3 -mx-6 -mt-6 rounded-t-xl'
          style={{ backgroundColor: `hsl(var(${cssVar}))` }}
        />
        <CardTitle className='text-base'>{name}</CardTitle>
        <CardDescription className='text-xs'>
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
}

export default ColorsPage
