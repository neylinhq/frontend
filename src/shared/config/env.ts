// Приватные переменные (только сервер)
export const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET || 'neylin-secret-key'

// API URL
// Production: https://api.neylin.io/v1
// Development: http://localhost:8080/v1
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1'

// Mock API flag
// Set VITE_MOCK_API=true to use MSW mock handlers instead of real backend
export const MOCK_API = import.meta.env.VITE_MOCK_API === 'true'

// Публичные переменные (доступны везде)
export const IS_DEV = import.meta.env.DEV
export const IS_PROD = import.meta.env.PROD

// Runtime environment
export const IS_BROWSER = typeof window !== 'undefined'
export const IS_SERVER = !IS_BROWSER
