import { createElement, Fragment } from 'react'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/shared/config/env'
import { server } from '@/shared/mocks/server'
import { renderWithProviders, screen, userEvent } from '@/shared/tests'
import { toast } from '@/shared/components/toast'
import { SignInForm } from '../sign-in-form'

vi.mock('@/shared/components/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

vi.mock('@/features/auth/telegram-login-button', () => ({
  TelegramLoginButton: () => null
}))

const LocationDisplay = () => {
  const location = useLocation()
  return createElement('div', { 'data-testid': 'location' }, location.pathname)
}

describe('SignInForm integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('navigates to return url after successful login', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, async ({ request }) => {
        const body = (await request.json()) as { email: string }
        return HttpResponse.json({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: body.email,
            createdAt: '2024-01-15T00:00:00.000Z'
          }
        })
      })
    )

    const user = userEvent.setup()
    renderWithProviders(
      createElement(
        Fragment,
        null,
        createElement(SignInForm),
        createElement(LocationDisplay)
      ),
      { route: '/auth/sign-in?from=/pricing' }
    )

    await user.type(screen.getByLabelText('auth.signIn.emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('auth.signIn.passwordLabel'), 'password123')
    await user.click(screen.getByRole('button', { name: 'auth.signIn.submitButton' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/pricing')
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows error toast on invalid credentials', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json(
          { error: { message: 'Invalid email or password' } },
          { status: 401 }
        )
      })
    )

    const user = userEvent.setup()
    renderWithProviders(
      createElement(
        Fragment,
        null,
        createElement(SignInForm),
        createElement(LocationDisplay)
      ),
      { route: '/auth/sign-in' }
    )

    await user.type(screen.getByLabelText('auth.signIn.emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('auth.signIn.passwordLabel'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'auth.signIn.submitButton' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
