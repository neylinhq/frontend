# План: Устранение мигания элементов при загрузке /docs/ui

## Диагноз проблемы

Мигание (~500мс) вызвано **двумя независимыми факторами**:

### 1. FOUC (Flash of Unstyled Content) - мигание темы
- SSR рендерит `<html lang="en">` **без** класса `dark`
- CSS правило `theme-transition-disabled` находится в `globals.css`, который загружается **асинхронно**
- Inline скрипт выполняется **ДО** загрузки CSS → правило не работает в критический момент

### 2. FOUT (Flash of Unstyled Text) - мигание шрифтов
- Google Fonts с `display=swap` показывает fallback шрифт, затем переключает
- Класс `theme-transition-disabled` снимается по событию `load`, но это не гарантирует загрузку шрифтов

---

## Решение: 4-уровневая защита

### Уровень 1: Critical CSS в `<head>`

Встроить критические CSS правила **перед** inline скриптом темы:

```css
/* Отключение transitions */
html.theme-transition-disabled,
html.theme-transition-disabled *,
html.theme-transition-disabled *::before,
html.theme-transition-disabled *::after {
  transition: none !important;
  transition-duration: 0s !important;
}

/* Базовые цвета для предотвращения белой вспышки */
html { background-color: #ffffff; color: #171717; }
html.dark { background-color: #121212; color: #ededed; }
```

### Уровень 2: SSR Theme Injection

Применить класс темы на сервере через `useRouteLoaderData("root")`:

```tsx
// В Layout компоненте
const data = useRouteLoaderData<RootLoaderData>('root')
const ssrDarkClass = data?.theme?.mode === 'dark' ? 'dark' : undefined

<html className={ssrDarkClass} ...>
```

### Уровень 3: Улучшенный timing снятия блокировки

Использовать `document.fonts.ready` API для синхронизации:

```javascript
Promise.all([
  document.fonts ? document.fonts.ready : Promise.resolve(),
  new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve);
  })
]).then(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-transition-disabled');
    });
  });
});
```

### Уровень 4: Оптимизация шрифтов

- Сократить начертания до реально используемых: `400;500;600;700`
- Убрать неиспользуемые: `100;200;300;italic`

---

## Файлы для изменения

### 1. `app/root.tsx`

**Изменения в Layout:**
- Добавить импорт `useRouteLoaderData`
- Добавить `<style>` тег с critical CSS перед inline скриптом
- Применить класс темы через `useRouteLoaderData("root")`
- Обновить inline скрипт с `document.fonts.ready`
- Оптимизировать links (убрать лишние начертания шрифтов)

### 2. `src/shared/styles/globals.css`

**Изменения:**
- Добавить комментарий о дублировании в root.tsx (строки 1414-1423)

---

## Детальная реализация

### root.tsx - Новый Layout компонент

```tsx
import { useRouteLoaderData } from 'react-router'

type RootLoaderData = {
  i18n: { locale: string }
  theme: { mode: 'dark' | 'light' | 'system'; palette: 'classic' | 'vanilla' | 'vivid' }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<RootLoaderData>('root')

  // SSR: применяем dark класс если mode === 'dark'
  const ssrDarkClass = data?.theme?.mode === 'dark' ? 'dark' : undefined
  const ssrPalette = data?.theme?.palette && data.theme.palette !== 'classic'
    ? data.theme.palette
    : undefined

  return (
    <html
      lang="en"
      className={ssrDarkClass}
      data-palette={ssrPalette}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* Critical CSS - ПЕРЕД скриптом темы */}
        <style dangerouslySetInnerHTML={{ __html: `
          html.theme-transition-disabled,
          html.theme-transition-disabled *,
          html.theme-transition-disabled *::before,
          html.theme-transition-disabled *::after {
            transition: none !important;
            transition-duration: 0s !important;
          }
          html { background-color: #ffffff; color: #171717; }
          html.dark { background-color: #121212; color: #ededed; }
        `}} />

        {/* Theme Script - ОБНОВЛЕННЫЙ */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              document.documentElement.classList.add('theme-transition-disabled');

              // Ждем загрузки шрифтов И DOM
              Promise.all([
                document.fonts ? document.fonts.ready : Promise.resolve(),
                new Promise(function(r) {
                  if (document.readyState === 'complete') r();
                  else window.addEventListener('load', r);
                })
              ]).then(function() {
                requestAnimationFrame(function() {
                  requestAnimationFrame(function() {
                    document.documentElement.classList.remove('theme-transition-disabled');
                  });
                });
              });

              function getCookie(n) {
                var m = document.cookie.match('(^|;)\\\\s*' + n + '\\\\s*=\\\\s*([^;]+)');
                return m ? m.pop() : null;
              }

              // localStorage > cookie > system
              var localMode = localStorage.getItem('ely-si-mode');
              var cookieMode = getCookie('ely-si-mode');
              var mode = localMode || cookieMode;
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark) || (!mode && systemDark);

              // Синхронизация с SSR (SSR мог установить dark из cookie)
              var hasDark = document.documentElement.classList.contains('dark');
              if (shouldBeDark && !hasDark) {
                document.documentElement.classList.add('dark');
              } else if (!shouldBeDark && hasDark) {
                document.documentElement.classList.remove('dark');
              }

              // Sync localStorage -> cookie
              if (localMode && localMode !== cookieMode) {
                document.cookie = 'ely-si-mode=' + localMode + '; path=/; max-age=31536000; SameSite=Lax';
              }

              // Palette
              var localPalette = localStorage.getItem('ely-si-palette');
              var cookiePalette = getCookie('ely-si-palette');
              var palette = localPalette || cookiePalette;
              var currentPalette = document.documentElement.dataset.palette;

              if (palette && palette !== 'classic' && palette !== currentPalette) {
                document.documentElement.dataset.palette = palette;
              } else if ((!palette || palette === 'classic') && currentPalette) {
                delete document.documentElement.dataset.palette;
              }

              if (localPalette && localPalette !== cookiePalette) {
                document.cookie = 'ely-si-palette=' + localPalette + '; path=/; max-age=31536000; SameSite=Lax';
              }

              // Locale
              var locale = localStorage.getItem('i18nextLng') || getCookie('i18nextLng') || 'en';
              document.documentElement.lang = locale;
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

### root.tsx - Оптимизированные links

```tsx
export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    // Убраны: 100, 200, 300, italic варианты
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap'
  }
]
```

---

## Почему это S+ решение

| Уровень | Что решает | Когда работает |
|---------|-----------|----------------|
| Critical CSS | CSS правило доступно сразу | До загрузки globals.css |
| SSR Injection | Класс `dark` уже в HTML | При SSR рендере |
| fonts.ready | Ждем загрузки шрифтов | После загрузки шрифтов |
| Оптимизация шрифтов | Быстрее загрузка | Уменьшен размер запроса |

**Результат:** Полное устранение мигания для всех сценариев:
- `mode: 'dark'` → SSR рендерит с классом, нет flash
- `mode: 'light'` → SSR рендерит без класса, нет flash
- `mode: 'system'` → Минимальный flash (только если system=dark, а cookie нет)

---

## Проверка после внедрения

1. Открыть http://localhost:5173/docs/ui
2. Очистить кеш (Ctrl+Shift+R)
3. Переключить тему на dark в настройках
4. Перезагрузить страницу - не должно быть мигания
5. Проверить с `mode: 'system'` и разными системными настройками
