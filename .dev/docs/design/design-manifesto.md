# Design Manifesto

Фундаментальная философия дизайна Neylin. Не style guide, не component library — декларация принципов.

---

## Кто мы и для кого

Neylin — EdTech платформа для визуального обучения. Карты знаний, AI-ассистент, система упражнений с интервальным повторением. Наши пользователи — студенты, которые хотят понимать, а не зубрить.

Обучение — уязвимый процесс. Студент, который не понимает тему, уже чувствует дискомфорт. Интерфейс не должен добавлять к этому ощущение "здесь всё сложно и серьёзно". Мы строим инструмент, который помогает, а не впечатляет.

---

## Центральный принцип

**Интерфейс исчезает, контент сияет.**

Приложение состоит из двух слоёв:

**Interface layer** — навигация, панели, формы, настройки. Это инфраструктура. Она должна быть нейтральной, сдержанной, невидимой. Пользователь не пришёл смотреть на sidebar.

**Content layer** — граф знаний, ноды, связи, упражнения. Это то, ради чего пользователь здесь. Контент может быть выразительным, цветным, живым. Цвет помогает различать типы, строить иерархии, запоминать структуру.

Когда интерфейс тихий — контент может быть громким без перегрузки. Минимализм и выразительность сосуществуют, когда каждый знает своё место.

---

## Принципы

### 1. Clarity over Cleverness

Каждый элемент служит цели. Декорация без функции — шум. Мы выбираем простые решения вместо впечатляющих. Пользователь не должен расшифровывать интерфейс — ясность это уважение к его времени.

Если что-то можно убрать без потери понимания — убирай.

### 2. Warmth without Softness

Профессионализм не требует холодности. Мы можем быть точными и при этом приветливыми. Neylin — строгий инструмент с тёплым сердцем.

Это выражается через:
- Цвет, который не кричит, но и не стерилен
- Типографику, которая читается, а не впечатляет
- Микрокопирование, которое объясняет, а не командует
- Скругления достаточные для мягкости, но не pill-shaped everywhere

MetaMask доказал: оранжевый primary может быть professional. OKX показал: pill buttons не означают несерьёзность. Warmth — не про детские иллюстрации. Это про отсутствие отстранённости.

### 3. Progressive Disclosure of Complexity

Новичок видит простой интерфейс. Эксперт находит глубину когда ищет. Один продукт для всех уровней.

Три режима:
- **Learner** — guided experience, tooltips везде, simplified creation
- **Student** — full features, keyboard hints, collaboration
- **Expert** — advanced options, API access, bulk operations

Это не три разных приложения. Это layers of depth в одном. Пользователь растёт — интерфейс растёт вместе с ним.

### 4. Function Drives Form

Визуальные решения вытекают из функциональных требований. Как элемент выглядит — отражает что он делает. 

- Кнопка действия выглядит иначе, чем кнопка навигации
- Опасное действие выглядит иначе, чем безопасное
- Состояние элемента очевидно без hover

Красота без пользы — отвлечение. Польза без красоты — холодность. Мы ищем пересечение.

### 5. Accessibility is Foundation

Доступность — не чеклист в конце, а мышление с начала. Keyboard navigation везде. Контрасты по WCAG AA. Semantic HTML. Screen reader support. `prefers-reduced-motion`.

Это не accommodation — это качество. Дизайн, который работает для людей с ограничениями, работает лучше для всех:
- Клавиатурные shortcuts помогают power users
- Высокий контраст читается на солнце
- Ясный язык помогает non-native speakers
- Субтитры полезны в шумных местах

---

## Визуальный язык

### Цвет

**Interface layer**: Нейтральная палитра. Фон отступает. Текст контрастный. Границы subtle. Интерактивные элементы muted кроме primary actions.

**Content layer**: Выразительная палитра. Каждый тип ноды имеет свой hue. Связи цветом показывают отношение. Цвет — мнемоника, навигация, способ парсить сложность.

**Семантика неизменна**: Когда цвет что-то значит — он всегда значит это. Красный = danger/error. Зелёный = success. Жёлтый = warning. Синий = info. Не путай пользователя.

**Helmholtz-Kohlrausch**: Мы используем OKLCH и компенсируем perceptual brightness для насыщенных цветов. Цвета одной lightness должны выглядеть одной светлоты.

### Типографика

Шрифт невидим когда работает. Пользователь пришёл читать контент, не любоваться буквами.

- Геометричный sans-serif для UI (Geist или подобный)
- 2-3 веса максимум — больше размывает иерархию
- Line length 50-75 символов для body text
- Line height 1.5-1.6 для body, 1.2-1.3 для headings
- Scale с consistent ratio (1.25 рекомендуется)

Размер создаёт иерархию. Вес усиливает. Цвет — почти никогда не используется для различения текста.

### Пространство

White space — не пустота, а breathing room. Cramped layouts создают тревогу. Generous spacing создаёт calm.

- Consistent scale (4px или 8px base)
- Related elements ближе, unrelated — дальше
- Density адаптируется под контекст: spacious для focus tasks, denser для data views
- Responsive: пропорции сохраняются, не фиксированные значения

Grid — невидимый guide. Пользователь не видит сетку, но чувствует её отсутствие. Alignment сигнализирует намерение. Misalignment — небрежность или хаос.

### Границы и глубина

Мы предпочитаем borders shadows. Тонкая линия разделяет честнее, чем иллюзия высоты.

Shadows используются для:
- Floating elements (modals, popovers, dropdowns)
- Drag operations (lifted state)
- Focus на критичных элементах

Shadows НЕ используются для:
- Cards на одном уровне
- Разделения секций
- Декорации

Elevation system:
- Level 0: На поверхности, border only
- Level 1: Чуть выше (menus, dropdowns) — subtle shadow
- Level 2: Парит (modals, dialogs) — выраженная shadow
- Level 3: Временно поднят (drag) — максимальная shadow

### Формы

Скругления minimal to moderate (4-8px). Полные pill-shapes только для tags, badges, chips.

Primary CTA может быть более rounded (до 12px или pill) для visual distinction и warmth. Но не всё подряд.

Consistency важнее novelty. Если cards имеют 8px radius — все cards имеют 8px radius.

---

## Движение и feedback

### Когда анимировать

Анимация — коммуникация, не развлечение. Движение должно:
- Показывать связь между состояниями
- Давать feedback на действие
- Направлять внимание

Движение НЕ должно:
- Впечатлять само по себе
- Задерживать пользователя
- Отвлекать от контента

### Timing

- **Instant (50-100ms)**: Hover states, micro-feedback
- **Fast (100-150ms)**: Button press, toggle, checkbox
- **Normal (200ms)**: Color transitions, fade in/out
- **Slow (300ms)**: Modals, drawers, significant changes

Ничего > 300ms кроме page transitions. Пользователь не должен ждать анимацию.

### Easing

- **ease-out** для появления (deceleration feels welcoming)
- **ease-in** для исчезновения (acceleration feels responsive)
- **ease-in-out** для изменения состояния
- **linear** почти никогда (выглядит mechanical)

### Feedback обязателен

Каждое действие — ответ. Молчание создаёт сомнение.

- Клик на кнопку → visual response немедленно
- Отправка формы → loading state
- Завершение операции → success confirmation
- Ошибка → понятное сообщение

Loading states появляются через 150-300ms — избегаем flicker для быстрых операций.

### Respect reduced motion

`prefers-reduced-motion: reduce` — не отключение, а упрощение. Fade вместо slide. Instant вместо animated. Но feedback остаётся.

---

## Adaptive Complexity

Neylin обслуживает разные уровни пользователей одним интерфейсом.

### Learner Mode 🌱

Первое знакомство с платформой. Guided experience.

- Onboarding tooltips на каждом элементе
- Simplified node creation (меньше типов, очевидные defaults)
- AI-ассистент prominent и proactive
- Gamification видна (streaks, progress)
- Keyboard shortcuts скрыты

### Student Mode 📚

Уверенное использование. Full features.

- Все типы нод и связей
- Exercise generation из любого контента
- Spaced repetition настраивается
- Keyboard shortcuts показываются
- Collaboration features

### Expert Mode 🎓

Power users. Maximum control.

- Custom node types и templates
- API access для интеграций
- Bulk operations
- Advanced analytics
- Minimal hand-holding

Переключение — явное, в settings. Но система может suggest upgrade когда видит ready patterns.

---

## Что мы не делаем

### Decoration without Purpose

Glitch effects, 3D transforms ради красоты, ornamental gradients — шум. Если удаление не вредит пониманию, этого не должно быть.

### Trends over Usability

Trends устаревают. Neumorphism, glassmorphism everywhere, excessive blur — вчерашний cutting edge, сегодняшний dated. Timeless > trendy.

### Complexity without Need

Каждый слой абстракции, каждый custom component, каждый novel pattern — cognitive load. Simple scales better than clever.

### Inconsistency

Inconsistent spacing, colors, interaction patterns — broken trust. Пользователь internalize patterns быстро. Нарушение ощущается как bug.

### Конкретные anti-patterns

**НЕ использовать:**
- Glitch/distortion effects
- Анимации > 300ms без причины
- Gradient backgrounds на UI
- Emojis в interface chrome (кроме content)
- Backdrop blur на больших областях (performance)
- Auto-playing content

**Вопросы для review:**
- "Это для пользователя или для ego дизайнера?"
- "Будет ли это выглядеть хорошо через 2 года?"
- "Добавляет clarity или complexity?"
- "Захочу ли я использовать это каждый день?"

---

## Закрытие

Дизайн — это решения. Каждый выбор о цвете, spacing, motion, hierarchy — это решение о том, что важно, а что нет.

Наша философия простая:

**Пусть интерфейс исчезает, чтобы контент сиял.**

Минимализм где он служит фокусу. Выразительность где она служит пониманию. Consistency для доверия. Accessibility для всех. Warmth для human connection.

Это не rulebook. Это lens. Используй для оценки решений. Когда сомневаешься — возвращайся к принципам.

Строй инструменты, которые уходят с пути. Строй canvas, который приглашает к созданию. Строй опыт, который помогает учиться.