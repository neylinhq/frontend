/**
 * API Delays Configuration
 *
 * Централизованные константы для имитации задержек API в режиме разработки.
 * Используются в mock API (subscription, user, session, map).
 */

/**
 * Задержки для API запросов (в миллисекундах)
 */
export const API_DELAYS = {
  // Subscription API
  SUBSCRIPTION_GET_CURRENT: 800,
  SUBSCRIPTION_GET_USAGE: 500,
  SUBSCRIPTION_GET_PLANS: 600,
  SUBSCRIPTION_GET_PLAN_DETAILS: 400,
  SUBSCRIPTION_CREATE_CHECKOUT: 1000,
  SUBSCRIPTION_CANCEL: 1000,
  SUBSCRIPTION_RESUME: 1000,
  SUBSCRIPTION_UPDATE: 1200,
  SUBSCRIPTION_GET_PAYMENT_METHODS: 200,
  SUBSCRIPTION_ADD_PAYMENT_METHOD: 400,
  SUBSCRIPTION_REMOVE_PAYMENT_METHOD: 300,
  SUBSCRIPTION_SET_DEFAULT_PAYMENT: 200,
  SUBSCRIPTION_GET_PAYMENT_HISTORY: 200,
  SUBSCRIPTION_CREATE_BILLING_PORTAL: 800,

  // User API
  USER_GET_CURRENT: 100,
  USER_UPDATE_PROFILE: 300,
  USER_UPDATE_PREFERENCES: 200,
  USER_UPLOAD_AVATAR: 500,
  USER_CHANGE_EMAIL: 400,
  USER_CHANGE_PASSWORD: 400,
  USER_DELETE_ACCOUNT: 500,

  // Session API
  SESSION_LOGIN: 1000,
  SESSION_REGISTER: 1000,
  SESSION_RESET_PASSWORD: 1000,
  SESSION_LOGOUT: 500,

  // Map API
  MAP_GET_MAPS: 500,
  MAP_GET_BY_ID: 300,
  MAP_CREATE: 600,
  MAP_DELETE: 400,
  MAP_GET_NODES: 400,
  MAP_GET_NODE_WITH_CONTENT: 300,
  MAP_CREATE_NODE: 500,
  MAP_UPDATE_NODE: 400,
  MAP_DELETE_NODE: 400,
  MAP_GET_EDGES: 400,
  MAP_CREATE_EDGE: 500,
  MAP_UPDATE_EDGE: 400,
  MAP_DELETE_EDGE: 400,
  MAP_GET_FULL_MAP: 800,
  MAP_ANALYZE_GRAPH: 2000,
} as const

/**
 * Задержки для UI компонентов (в миллисекундах)
 */
export const UI_DELAYS = {
  // Block Editor
  EDITOR_MENU_HIDE: 100,
  EDITOR_THROTTLE: 16, // ~60fps
  EDITOR_GHOST_CLEANUP: 500,
} as const

/**
 * Вспомогательная функция для создания promise задержки
 * @param ms - задержка в миллисекундах
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
