import { test, expect } from '@playwright/test'

test.describe('E2E Infrastructure Smoke Test', () => {
  test('playwright runs with correct configuration', async ({ page }) => {
    await page.goto('data:text/html,<h1>Playwright Works</h1>')

    await expect(page.locator('h1')).toHaveText('Playwright Works')
  })
})
