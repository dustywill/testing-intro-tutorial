import { test, expect } from '@playwright/test'

test.describe('Grid Filtering and Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.ag-root')
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    await expect(rows.first()).toBeVisible()
  })

  test('filters tasks by keyword using search input', async ({ page }) => {
    const searchInput = page.getByLabel('Search tasks')
    await searchInput.fill('auth')

    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    await expect(rows).toHaveCount(1)

    const visibleRow = rows.first()
    await expect(visibleRow).toContainText('auth')

    await searchInput.clear()
    const clearedRows = page.locator('.ag-center-cols-viewport .ag-row')
    const clearedCount = await clearedRows.count()
    expect(clearedCount).toBeGreaterThanOrEqual(5)
  })

  test('search matches across multiple columns (assignee)', async ({ page }) => {
    const searchInput = page.getByLabel('Search tasks')

    await searchInput.fill('Charlie')
    const rowsCharlie = page.locator('.ag-center-cols-viewport .ag-row')
    await expect(rowsCharlie).toHaveCount(1)
    await expect(rowsCharlie.first()).toContainText('Charlie')
  })

  test('search matches across multiple columns (status)', async ({ page }) => {
    const searchInput = page.getByLabel('Search tasks')

    await searchInput.fill('in-progress')
    const rowsInProgress = page.locator('.ag-center-cols-viewport .ag-row')
    const count = await rowsInProgress.count()
    expect(count).toBeGreaterThanOrEqual(1)

    const firstRow = rowsInProgress.first()
    await expect(firstRow).toContainText('in-progress')
  })

  test('search returns no results for non-matching keyword', async ({ page }) => {
    const searchInput = page.getByLabel('Search tasks')
    await searchInput.fill('xyznonexistent123')

    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    await expect(rows).toHaveCount(0)
  })
})
