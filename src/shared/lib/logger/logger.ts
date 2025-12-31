type LoggerFn = (...args: unknown[]) => void
type LoggerTarget = {
  debug?: LoggerFn
  info?: LoggerFn
  warn?: LoggerFn
  error?: LoggerFn
}

const getLoggerTarget = (): LoggerTarget | undefined =>
  (globalThis as { __NEYLIN_LOGGER__?: LoggerTarget }).__NEYLIN_LOGGER__

const logToTarget = (level: keyof LoggerTarget, args: unknown[]) => {
  const target = getLoggerTarget()
  if (!target) return
  const handler = target[level] ?? target.info
  if (handler) {
    handler(...args)
  }
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      logToTarget('debug', args)
    }
  },
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      logToTarget('info', args)
    }
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      logToTarget('warn', args)
    }
  },
  error: (...args: unknown[]) => {
    logToTarget('error', args)
  }
}
