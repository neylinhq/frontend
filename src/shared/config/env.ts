// Приватные переменные (только сервер)
export const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET || 'arbor-secret-key'
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Публичные переменные (доступны везде)
export const IS_DEV = import.meta.env.DEV
export const IS_PROD = import.meta.env.PROD
