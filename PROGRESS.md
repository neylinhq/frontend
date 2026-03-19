# Frontend — что разобрано

## app/ (каркас приложения)
- [x] root.tsx — Layout, App, провайдеры, ErrorBoundary, inline theme script
- [x] entry.client.tsx — hydration, startTransition, enableMocking
- [x] entry.server.tsx — SSR, renderToPipeableStream, isbot, per-request i18n
- [x] routes.ts — маршрутизация, route(), layout(), index()
- [x] routes/auth/logout.ts — action-only route
- [x] routes/auth/sign-in.tsx — handle + meta + делегация в page
- [x] routes/home.tsx — loader с редиректом по auth
- [x] routes/api.refresh.ts — resource route для refresh token
- [x] routes/public/layout.tsx — useMatches + handle паттерн
- [x] routes/auth/verify-email.tsx — loader + URL parsing

## src/shared/
- [x] config/env.ts — переменные окружения, IS_BROWSER/IS_SERVER
- [x] config/routes.ts — константы маршрутов, динамические роуты
- [x] api/client.ts — HTTP клиент, refresh token mutex, conditional spread
- [x] api/server.ts — серверный fetch с пробросом cookies
- [x] lib/locale/locale.ts — SupportedLanguage, getLocale из cookies

## src/app/i18n/
- [x] i18n.client.ts — клиентская инициализация, changeLanguage в localStorage + cookie
- [x] i18n.server.ts — серверная i18n, чтение JSON с диска
- [x] i18n.factory.server.ts — изолированный i18next instance per request

## src/entities/
- [x] user/ — schema, api, queries, index (полностью)
- [x] map/ — schema (MapEntity, FullMap, history, search, dashboard)
- [x] node/ — schema (NodeType, Complexity, LightweightNode, position)
- [x] edge/ — schema (RelationType, EdgeMetadata, strength, bidirectional)
- [ ] map/ — api, queries
- [ ] node/ — api, queries
- [ ] edge/ — api, queries, hooks, components
- [ ] ai/, exercise/, progress/, session/, subscription/, two-factor/

## src/features/
- [x] settings/security-forms/components/password-change-form.tsx — Zod + React Hook Form + TanStack Query

## Не начато
- [ ] shared/components/ — UI компоненты (Button, Card, Modal, Radix)
- [ ] shared/hooks/
- [ ] shared/lib/ (кроме locale)
- [ ] shared/core/
- [ ] features/ (кроме password-change-form)
- [ ] widgets/
- [ ] pages/

## Концепции
- [x] FSD архитектура (слои, правила импорта)
- [x] SSR + гидрация (сервер рендерит HTML, клиент подключает React)
- [x] React Router 7 (loader, action, handle, Outlet, clientLoader, serverLoader)
- [x] TypeScript (typeof, keyof, as const, generics, Omit, Partial, extends)
- [x] Zod (схемы, z.infer, refine, extend, omit, zodResolver)
- [x] TanStack Query (useQuery, useMutation, queryKeys, setQueryData, invalidateQueries, staleTime, isPending)
- [x] React Hook Form (useForm, FormField render prop, handleSubmit, isDirty)
- [x] i18n (двойное хранилище, изолированные instance на сервере)
- [x] HTTP клиент (fetch обертка, refresh token mutex, BFF)
- [x] Zustand (create, set, get, selectors, persist, отдельные сторы vs slices)
- [x] Промисы (async/await, микротаски, finally, мьютекс паттерн)
- [x] Прототипы (Object.create, цепочка __proto__, hasOwnProperty)
- [x] this (обычная vs стрелочная функция, strict/sloppy, среды)
