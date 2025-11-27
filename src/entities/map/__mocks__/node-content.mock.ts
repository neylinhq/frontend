import type { Node } from '../map.schema'

// Rich content mock for editor testing
  id: 'mock-editor',
  mapId: '1',
  label: 'Пример узла с контентом',
  description:
    'Демонстрация всех возможностей редактора: форматирование, списки, таблицы, формулы, callouts',
  content: `<h1>Пример контента</h1>
<p>Это <strong>демонстрационный узел</strong> с богатым контентом для тестирования всех возможностей редактора.</p>
<h2>Форматирование текста</h2>
<p>Поддерживаются различные стили: <strong>жирный</strong>, <em>курсив</em>, <u>подчеркнутый</u>, <s>зачеркнутый</s>, <code>код</code>.</p>
<h2>Списки</h2>
<ul>
  <li>Маркированный список</li>
  <li>Элемент 2</li>
  <li>Элемент 3</li>
</ul>
<ol>
  <li>Нумерованный список</li>
  <li>Пункт второй</li>
  <li>Пункт третий</li>
</ol>
<h2>Информационные блоки</h2>
<div data-type="callout" data-variant="info">
  <p>💡 Это информационный блок (callout) для важных заметок.</p>
</div>
<div data-type="callout" data-variant="warning">
  <p>⚠️ Это предупреждение - используйте для важных замечаний.</p>
</div>
<h2>Математические формулы</h2>
<p>Inline формула: <span data-type="mathInline" data-latex="E=mc^2">E=mc²</span></p>
<div data-type="mathBlock" data-latex="\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n">∑ᵢ₌₁ⁿ xᵢ = x₁ + x₂ + ⋯ + xₙ</div>
<h2>Цитаты</h2>
<blockquote><p>Это цитата. Используется для выделения важных мыслей или ссылок на источники.</p></blockquote>
<p>Редактор поддерживает все эти элементы и сохраняет их в HTML формате.</p>`,
  type: 'concept',
  position: { x: 0, y: 0 },
  metadata: {
    confidence: 0.95,
    complexity: 'intermediate',
    tags: ['demo', 'example', 'редактор'],
    reviewCount: 0
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export { MOCK_NODE_WITH_CONTENT }
