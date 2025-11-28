# SSR Architecture

## Overview

Arbor использует React Router v7 с SSR (Server-Side Rendering). Основные проблемы SSR — это FOUC (Flash of Unstyled Content) и мигание при загрузке lazy CSS. Эта документация описывает архитектурные решения для их предотвращения.

---

## Theme System

### Проблема

На сервере мы не можем узнать системную тему (`prefers-color-scheme`), а пользовательские настройки хранятся в `localStorage`, который недоступен при SSR. Это приводит к миганию при гидратации.

### Решение: Cookie Sync

```
localStorage (клиент) → cookie → SSR loader → html class
```

1. **Инлайн-скрипт** синхронизирует `localStorage` → cookie при каждой загрузке
2. **Server loader** читает cookie и передает тему в Layout
3. **Layout** применяет `dark` class и `data-palette` к `<html>` при SSR
4. **Inline script** корректирует класс если нужно (system mode)

### Файлы

- [root.tsx](../../app/root.tsx) — Layout + inline script
- [theme.server.ts](../../src/app/theme/theme.server.ts) — SSR cookie parsing
- [theme-provider.tsx](../../src/app/theme/components/theme-provider.tsx) — клиентский state

### Critical CSS

В `<head>` встроен критический CSS с базовыми цветами для каждой темы:

```tsx
<style dangerouslySetInnerHTML={{
  __html: `
    html { background-color: #ffffff; color: #171717; }
    html.dark { background-color: #121212; color: #ededed; }
    html[data-palette="vanilla"] { background-color: #faf9f7; ... }
    ...
  `
}} />
```

Это предотвращает белую вспышку до загрузки основных стилей.

---

## Transition Flashing

### Проблема

CSS с `transition: all` анимирует изменения CSS-переменных. При lazy loading CSS (code splitting) переменные применяются не сразу, что вызывает ~500ms анимацию элементов.

### Решение: Navigation-aware transitions

Класс `theme-transition-disabled` отключает все transitions:

```css
html.theme-transition-disabled,
html.theme-transition-disabled *,
html.theme-transition-disabled *::before,
html.theme-transition-disabled *::after {
  transition: none !important;
  transition-duration: 0s !important;
}
```

### Lifecycle

1. **Inline script** добавляет класс при загрузке страницы
2. **useNavigation()** в App управляет классом во время навигации:

```tsx
const navigation = useNavigation()

useEffect(() => {
  if (navigation.state === 'loading') {
    document.documentElement.classList.add('theme-transition-disabled')
  } else if (navigation.state === 'idle') {
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition-disabled')
    }, 50) // задержка для применения lazy CSS
    return () => clearTimeout(timer)
  }
}, [navigation.state])
```

### Важно

- **НЕ** использовать `transition: all` в критических компонентах
- При смене темы используется `withoutTransitions()` helper
- Hover transitions работают только когда класс снят (navigation.state === 'idle')

---

## Route Handle Pattern

### Проблема

Некоторые страницы управляют своим скроллом (например, редактор с несколькими панелями). Если parent layout узнает об этом через `useEffect`, первый рендер будет со скроллбаром, а потом он исчезнет — мигание.

### Решение: handle export

Child route экспортирует `handle`:

```tsx
// app/routes/dashboard/maps/$mapId/node.$nodeId.tsx
export const handle = { disableScroll: true }
```

Parent layout читает через `useMatches()`:

```tsx
// app/routes/dashboard/layout.tsx
const matches = useMatches()

const disableScroll = matches.some(
  match => (match.handle as { disableScroll?: boolean })?.disableScroll
)

return (
  <DashboardLayout disableScroll={disableScroll}>
    <Outlet />
  </DashboardLayout>
)
```

### Преимущества

- Значение известно **до первого рендера**
- Нет useEffect → нет мигания
- Декларативно на уровне роута

---

## Hydration Warnings

### suppressHydrationWarning

`<html>` имеет `suppressHydrationWarning` потому что inline script может изменить классы до гидратации.

### Вложенные ссылки

React выдает hydration error при `<a>` внутри `<a>`. Компонент `<Logo>` поддерживает `href={false}` чтобы рендерить `<div>` вместо `<Link>`:

```tsx
<Link to={ROUTES.home}>
  <Logo size="lg" href={false} />  {/* div, не Link */}
</Link>
```

---

## Checklist для новых страниц

1. **Страница со своим скроллом?** → добавить `export const handle = { disableScroll: true }`
2. **Lazy CSS с `transition: all`?** → transitions будут отключены во время навигации автоматически
3. **Нужен user из сессии?** → использовать loader + useLoaderData, не client-side fetch
4. **Nested links?** → передавать `href={false}` внутреннему компоненту

---

## Quick Reference

| Задача | Решение |
|--------|---------|
| Передать данные с сервера | `loader()` + `useLoaderData()` |
| Тема без мигания | Cookie sync + inline script |
| Отключить скролл layout | `export const handle = { disableScroll: true }` |
| Читать handle в parent | `useMatches()` |
| Отключить transitions | `.add('theme-transition-disabled')` |
| Избежать nested `<a>` | `href={false}` prop |
