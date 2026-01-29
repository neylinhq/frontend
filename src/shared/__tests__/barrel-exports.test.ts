import '@/entities/ai'
import '@/entities/edge'
import '@/entities/exercise'
import '@/entities/map'
import '@/entities/node'
import '@/entities/progress'
import '@/entities/session'
import '@/entities/subscription'
import '@/entities/two-factor'
import '@/entities/user'
import '@/shared/lib/card-utils.ts'
import '@/shared/lib/cn.ts'
import '@/shared/lib/crypto-utils.ts'
import '@/shared/lib/get-meta.ts'
import '@/shared/lib/locale.ts'
import '@/shared/lib/logger.ts'
import '@/shared/lib/markdown.ts'
import '@/shared/lib/platform.ts'
import '@/shared/lib/pluralize.ts'
import '@/shared/lib/rating.ts'
import '@/shared/lib/sanitize.ts'
import '@/shared/lib/use-copy-to-clipboard.ts'
import '@/shared/lib/viewport.ts'
import '@/shared/lib/websocket-client.ts'
import { describe, expect, it } from 'vitest'

describe('barrel exports', () => {
  it('loads barrel modules', () => {
    expect(true).toBe(true)
  })
})
