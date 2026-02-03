import { test, expect } from '@playwright/test'

test.describe('Task Lifecycle', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.ag-root')
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    await expect(rows.first()).toBeVisible()
  })

  test('displays seed tasks in AG Grid on load', async ({ page }) => {
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(5)

    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Assignee' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Due Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Priority' })).toBeVisible()
  })

  test('creates a new task via form', async ({ page }) => {
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    const initialCount = await rows.count()

    await page.getByRole('button', { name: 'New Task' }).click()

    await page.getByLabel('Title').fill('E2E Created Task')
    await page.getByLabel('Status').selectOption('todo')
    await page.getByLabel('Assignee').fill('E2EUser')
    await page.getByLabel('Due Date').fill('2025-06-15')
    await page.getByLabel('Priority').selectOption('high')

    await page.getByRole('button', { name: 'Save Task' }).click()

    const formSection = page.locator('#taskFormSection')
    await expect(formSection).toHaveAttribute('hidden', '')

    await expect(rows).toHaveCount(initialCount + 1)

    const taskCell = page.locator('.ag-cell').filter({ hasText: 'E2E Created Task' }).first()
    await expect(taskCell).toBeVisible()
  })

  test('edits a task via form (double-click row)', async ({ page }) => {
    const targetRow = page.locator('.ag-center-cols-viewport .ag-row').first()
    await targetRow.dblclick()

    const formSection = page.locator('#taskFormSection')
    await expect(formSection).not.toHaveAttribute('hidden')

    const titleInput = page.getByLabel('Title')
    await titleInput.clear()
    await titleInput.fill('Updated via E2E')

    await page.getByRole('button', { name: 'Save Task' }).click()

    await expect(formSection).toHaveAttribute('hidden', '')

    const updatedCell = page.locator('.ag-cell').filter({ hasText: 'Updated via E2E' })
    await expect(updatedCell).toBeVisible()

    await page.reload()
    await page.waitForSelector('.ag-root')

    const persistedCell = page.locator('.ag-cell').filter({ hasText: 'Updated via E2E' })
    await expect(persistedCell).toBeVisible()
  })

  test('deletes a task with confirmation', async ({ page }) => {
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    const initialCount = await rows.count()

    const firstRow = page.locator('.ag-center-cols-viewport .ag-row').first()
    const titleCell = firstRow.locator('.ag-cell').first()
    const titleText = await titleCell.textContent()

    await firstRow.click()
    await page.waitForTimeout(100)

    const deleteBtn = page.getByRole('button', { name: 'Delete' })
    const isEnabled = await deleteBtn.isEnabled()

    if (!isEnabled) {
      await page.evaluate(() => {
        const row = document.querySelector('.ag-center-cols-viewport .ag-row')
        if (row && window.gridApi) {
          const rowNode = window.gridApi.getRowNode(row.getAttribute('row-id'))
          if (rowNode) {
            rowNode.setSelected(true)
          }
        }
      })
      await page.waitForTimeout(100)
    }

    await expect(deleteBtn).toBeEnabled({ timeout: 5000 })

    page.on('dialog', dialog => dialog.accept())
    await deleteBtn.click()

    await expect(rows).toHaveCount(initialCount - 1)

    const deletedCell = page.locator('.ag-cell').filter({ hasText: titleText })
    await expect(deletedCell).toHaveCount(0)
  })

  test('cancels delete when declining confirmation', async ({ page }) => {
    const rows = page.locator('.ag-center-cols-viewport .ag-row')
    const initialCount = await rows.count()

    const firstRow = page.locator('.ag-center-cols-viewport .ag-row').first()
    await firstRow.click()
    await page.waitForTimeout(100)

    const deleteBtn = page.getByRole('button', { name: 'Delete' })
    const isEnabled = await deleteBtn.isEnabled()

    if (!isEnabled) {
      await page.evaluate(() => {
        const row = document.querySelector('.ag-center-cols-viewport .ag-row')
        if (row && window.gridApi) {
          const rowNode = window.gridApi.getRowNode(row.getAttribute('row-id'))
          if (rowNode) {
            rowNode.setSelected(true)
          }
        }
      })
      await page.waitForTimeout(100)
    }

    await expect(deleteBtn).toBeEnabled({ timeout: 5000 })

    page.on('dialog', dialog => dialog.dismiss())
    await deleteBtn.click()

    await expect(rows).toHaveCount(initialCount)
  })
})
