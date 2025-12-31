import { expect, test } from '@playwright/test'

test('user can sign in and gets redirected', async ({ page }) => {
  await page.goto('/auth/sign-in?from=/pricing')
  await page.fill('input[name="email"]', 'user@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/pricing')
})
