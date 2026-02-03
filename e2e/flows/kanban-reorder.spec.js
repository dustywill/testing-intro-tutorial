import { test, expect } from '@playwright/test';

test.describe('Kanban Board Task Reordering', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kanban-board');
    await page.waitForTimeout(200);
  });

  test('displays Kanban board with three columns', async ({ page }) => {
    const kanbanBoard = page.locator('#kanban-board');
    await expect(kanbanBoard).toBeVisible();

    const columns = page.locator('.kanban-column');
    await expect(columns).toHaveCount(3);

    const todoColumn = page.locator('.kanban-column[data-status="todo"]');
    const inProgressColumn = page.locator('.kanban-column[data-status="in-progress"]');
    const doneColumn = page.locator('.kanban-column[data-status="done"]');

    await expect(todoColumn).toBeVisible();
    await expect(inProgressColumn).toBeVisible();
    await expect(doneColumn).toBeVisible();

    await expect(todoColumn.locator('h3')).toHaveText('To Do');
    await expect(inProgressColumn.locator('h3')).toHaveText('In Progress');
    await expect(doneColumn.locator('h3')).toHaveText('Done');
  });

  test('displays task cards in appropriate columns based on status', async ({ page }) => {
    const todoCards = page.locator('[data-status="todo"] .kanban-card');
    const inProgressCards = page.locator('[data-status="in-progress"] .kanban-card');
    const doneCards = page.locator('[data-status="done"] .kanban-card');

    await expect(todoCards.first()).toBeVisible({ timeout: 2000 });

    const todoCount = await todoCards.count();
    const inProgressCount = await inProgressCards.count();
    const doneCount = await doneCards.count();

    expect(todoCount + inProgressCount + doneCount).toBeGreaterThanOrEqual(5);

    const firstTodoCard = todoCards.first();
    await expect(firstTodoCard).toBeVisible();
    await expect(firstTodoCard.locator('strong')).toBeVisible();
  });

  test('can drag task between columns to change status (E2E-04)', async ({ page }) => {
    const todoColumn = page.locator('.kanban-tasks[data-status="todo"]');
    const inProgressColumn = page.locator('.kanban-tasks[data-status="in-progress"]');

    const initialTodoCount = await todoColumn.locator('.kanban-card').count();
    const initialInProgressCount = await inProgressColumn.locator('.kanban-card').count();

    const firstTodoCard = todoColumn.locator('.kanban-card').first();
    const taskId = await firstTodoCard.getAttribute('data-task-id');

    const cardBox = await firstTodoCard.boundingBox();
    const targetBox = await inProgressColumn.boundingBox();

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);

    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.waitForTimeout(100);

    await page.mouse.up();
    await page.waitForTimeout(300);

    const updatedTodoCount = await todoColumn.locator('.kanban-card').count();
    const updatedInProgressCount = await inProgressColumn.locator('.kanban-card').count();

    expect(updatedTodoCount).toBe(initialTodoCount - 1);
    expect(updatedInProgressCount).toBe(initialInProgressCount + 1);

    const movedCard = inProgressColumn.locator(`.kanban-card[data-task-id="${taskId}"]`);
    await expect(movedCard).toBeVisible();

    await page.reload();
    await page.waitForSelector('#kanban-board');

    const persistedCard = inProgressColumn.locator(`.kanban-card[data-task-id="${taskId}"]`);
    await expect(persistedCard).toBeVisible();
  });

  test('can drag task within column to reorder', async ({ page }) => {
    const todoColumn = page.locator('.kanban-tasks[data-status="todo"]');
    const cards = todoColumn.locator('.kanban-card');

    const cardCount = await cards.count();

    if (cardCount < 2) {
      test.skip();
    }

    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    const firstTaskId = await firstCard.getAttribute('data-task-id');
    const secondTaskId = await secondCard.getAttribute('data-task-id');

    const secondCardBox = await secondCard.boundingBox();

    await firstCard.hover();
    await page.mouse.down();
    await page.waitForTimeout(100);

    await page.mouse.move(secondCardBox.x + secondCardBox.width / 2, secondCardBox.y + secondCardBox.height + 10, { steps: 10 });
    await page.waitForTimeout(100);

    await page.mouse.up();
    await page.waitForTimeout(300);

    const cardsAfterDrag = todoColumn.locator('.kanban-card');
    const firstCardAfter = cardsAfterDrag.first();
    const firstTaskIdAfter = await firstCardAfter.getAttribute('data-task-id');

    expect(firstTaskIdAfter).toBe(secondTaskId);
  });

  test('keyboard navigation moves tasks between columns', async ({ page }) => {
    const todoColumn = page.locator('.kanban-tasks[data-status="todo"]');
    const inProgressColumn = page.locator('.kanban-tasks[data-status="in-progress"]');

    const firstTodoCard = todoColumn.locator('.kanban-card').first();
    const taskId = await firstTodoCard.getAttribute('data-task-id');

    await firstTodoCard.focus();
    await page.keyboard.press('ArrowRight');

    await page.waitForTimeout(300);

    const movedCard = inProgressColumn.locator(`.kanban-card[data-task-id="${taskId}"]`);
    await expect(movedCard).toBeVisible();
  });
});
