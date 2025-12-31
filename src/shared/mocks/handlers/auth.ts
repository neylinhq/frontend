import { delay, HttpResponse, http } from 'msw'
import { API_URL } from '@/shared/config/env'
import { generateMockTokens, MOCK_CREDENTIALS, mockUser } from '../data'

export const authHandlers = [
  // Register
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }

    // Simulate email already exists
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'User with this email already exists' }
        },
        { status: 409 }
      )
    }

    const tokens = generateMockTokens()
    const newUser = {
      ...mockUser,
      id: crypto.randomUUID(),
      email: body.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      displayName:
        `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.email.split('@')[0],
      createdAt: new Date().toISOString()
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: newUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      },
      { status: 201 }
    )
  }),

  // Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { email: string; password: string }

    // Check credentials
    if (body.email !== MOCK_CREDENTIALS.email || body.password !== MOCK_CREDENTIALS.password) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
        },
        { status: 401 }
      )
    }

    const tokens = generateMockTokens()
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  }),

  // Telegram bot info
  http.get(`${API_URL}/oauth/telegram/info`, async () => {
    await delay(150)
    return HttpResponse.json({
      success: true,
      data: {
        bot_username: 'neylin_mock_bot',
        bot_id: 'mock-telegram-bot'
      }
    })
  }),

  // Telegram login
  http.post(`${API_URL}/oauth/telegram/login`, async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: {
        user: mockUser,
        is_new_user: false
      }
    })
  }),

  // Refresh token
  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    await delay(100)
    const body = (await request.json()) as { refreshToken: string }

    if (!body.refreshToken || !body.refreshToken.startsWith('mock-refresh-')) {
      return HttpResponse.json(
        { success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid refresh token' } },
        { status: 401 }
      )
    }

    const tokens = generateMockTokens()
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  }),

  // Logout
  http.post(`${API_URL}/auth/logout`, async () => {
    await delay(100)
    return new HttpResponse(null, { status: 204 })
  }),

  // Forgot password
  http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
    await delay(500)
    const _body = (await request.json()) as { email: string }

    // Always return success (security: don't reveal if email exists)
    return HttpResponse.json({
      success: true,
      data: {
        message: 'If the email exists, a password reset link has been sent'
      }
    })
  }),

  // Reset password
  http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { token: string; password: string }

    if (!body.token || body.token.length < 10) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'TOKEN_INVALID', message: 'Invalid or expired reset token' }
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Password has been reset successfully'
      }
    })
  })
]
