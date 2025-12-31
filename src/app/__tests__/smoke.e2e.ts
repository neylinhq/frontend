import { expect, test } from '@playwright/test'

test('home page exposes sign-up entry point', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href="/auth/sign-up"]').first()).toBeVisible()
})
