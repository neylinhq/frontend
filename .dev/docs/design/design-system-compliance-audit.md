Задача: Провести аудит консистентности использования дизайн-системы в компонентах. Ищи отклонения от системы, хардкод, нарушения паттернов.

Контекст: EdTech приложение — визуальный граф-редактор (карты знаний), AI-чат, система упражнений. React, Tailwind, shadcn/ui. Дизайн-система в globals.css через CSS custom properties.

Приложи:
- globals.css (токены)
- Компоненты для анализа

---

Анализируй:

1. Нарушения токенов
   - Хардкод вместо токенов (цвета, размеры, отступы, тени)
   - Tailwind arbitrary values (`text-[#xxx]`, `p-[17px]`) вместо системных классов
   - Inline styles, обходящие систему

2. Семантические нарушения
   - Цвет не по назначению (destructive для не-destructive, muted для акцентов)
   - Нарушение иерархии (background/foreground, primary/secondary)
   - Семантически неверный токен вместо визуально похожего

3. Interactive states
   - Полнота: hover, focus, active, disabled у всех интерактивных элементов
   - Консистентность состояний между похожими компонентами
   - focus-visible для keyboard navigation
   - disabled: не только визуально, но и aria

4. Dark mode
   - Корректность работы всех компонентов
   - Хардкод-цвета, ломающиеся при переключении
   - CSS variables vs прямые цвета

5. Spacing и layout
   - Соответствие spacing scale (4px/8px base)
   - Magic numbers в margins/paddings
   - Консистентность gaps между однотипными элементами

6. Типографика
   - Typography scale vs произвольные размеры
   - Консистентность font-weights
   - Line-height для разных размеров

7. Компонентные паттерны
   - Дублирование логики между компонентами
   - Использование базовых компонентов vs пересоздание
   - Консистентность props API

8. Accessibility
   - Keyboard access для интерактивных элементов
   - Контрасты (особенно muted text на muted backgrounds)
   - aria-labels
   - prefers-reduced-motion

9. Responsive
   - Единообразие breakpoints
   - Компоненты, ломающиеся на mobile
   - Touch targets (min 44px)

10. Границы и тени
    - Соответствие elevation system
    - Консистентность border-radius
    - Логика выбора border vs shadow

---

Формат:

[SEVERITY] Категория: Описание

Файл: path/to/file.tsx
Строка: XX
Код: `фрагмент`

Проблема: Что не так
Последствие: Что сломается

---

Severity:
- 🔴 CRITICAL — Ломает функциональность или accessibility
- 🟠 MAJOR — Явное нарушение системы, видимая inconsistency  
- 🟡 MINOR — Отклонение от best practices

---

Summary в конце:
- Количество нарушений по severity
- Top-3 повторяющихся паттерна
- Компоненты с наибольшим числом нарушений

---

Не нужно: похвал, предложений исправления, анализа самих токенов, субъективных оценок.