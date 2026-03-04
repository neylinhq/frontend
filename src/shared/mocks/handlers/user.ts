import { delay, HttpResponse, http } from 'msw'

import { API_URL } from '@/shared/config/env'

import { MOCK_CREDENTIALS, mockUser } from '../data'

// Mutable user state for updates
let currentUser = { ...mockUser }

export const userHandlers = [
  // Get current user
  http.get(`${API_URL}/users/me`, async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: currentUser
    })
  }),

  // Update profile
  http.patch(`${API_URL}/users/me`, async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as Partial<typeof currentUser>
    currentUser = { ...currentUser, ...body }

    return HttpResponse.json({
      success: true,
      data: currentUser
    })
  }),

  // Update preferences
  http.put(`${API_URL}/users/me/preferences`, async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as typeof currentUser.preferences
    currentUser = { ...currentUser, preferences: body }

    return HttpResponse.json({
      success: true,
      data: currentUser
    })
  }),

  // Upload avatar
  http.post(`${API_URL}/users/me/avatar`, async ({ request }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Generate a mock avatar URL
    const seed = Date.now().toString()
    currentUser = {
      ...currentUser,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    }

    return HttpResponse.json({
      success: true,
      data: currentUser
    })
  }),

  // Change password
  http.post(`${API_URL}/users/me/change-password`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { currentPassword: string; newPassword: string }

    if (body.currentPassword !== MOCK_CREDENTIALS.password) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' }
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Password changed successfully'
      }
    })
  }),

  // Change email
  http.post(`${API_URL}/users/me/change-email`, async ({ request }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { newEmail: string; password: string }

    if (body.password !== MOCK_CREDENTIALS.password) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Password is incorrect' }
        },
        { status: 400 }
      )
    }

    currentUser = { ...currentUser, email: body.newEmail }

    return HttpResponse.json({
      success: true,
      data: currentUser
    })
  }),

  // Delete account
  http.delete(`${API_URL}/users/me`, async ({ request }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    // Reset to default user for next session
    currentUser = { ...mockUser }

    return new HttpResponse(null, { status: 204 })
  })
]

// Export for resetting state in tests
export const resetUserState = () => {
  currentUser = { ...mockUser }
}
