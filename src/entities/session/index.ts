// Клиентский API экспортируем явно

export * from './session.api' // Если есть клиентские запросы
export * from './session.queries' // Если есть хуки React Query
export * from './session.store'
export * from './session.types'

// Серверный код НЕ экспортируем через index.ts, его нужно импортировать напрямую из файла .server.ts
// Это правило React Router/Remix: серверный код должен быть изолирован
