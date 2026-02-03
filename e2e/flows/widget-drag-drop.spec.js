import { test, expect } from '@playwright/test';

test.describe('Widget Dashboard Drag-Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#widget-container');
  });

  test('displays three widget panels in initial order', async ({ page }) => {
    const widgets = page.locator('.widget-panel');
    await expect(widgets).toHaveCount(3);

    const widgetIds = await widgets.evaluateAll(elements =>
      elements.map(el => el.dataset.widgetId)
    );

    expect(widgetIds).toEqual(['tasks-summary', 'priority-chart', 'status-overview']);
  });

  test('can drag widget to new position', async ({ page }) => {
    const sourceHandle = page.locator('[data-widget-id="priority-chart"] .widget-handle');
    const target = page.locator('[data-widget-id="tasks-summary"]');

    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await target.boundingBox();

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 10, targetBox.y + targetBox.height / 2, { steps: 5 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    await page.waitForTimeout(200);

    const widgets = page.locator('.widget-panel');
    const widgetIds = await widgets.evaluateAll(elements =>
      elements.map(el => el.dataset.widgetId)
    );

    expect(widgetIds).toEqual(['priority-chart', 'tasks-summary', 'status-overview']);
  });

  test('widget layout persists after page refresh', async ({ page }) => {
    const sourceHandle = page.locator('[data-widget-id="priority-chart"] .widget-handle');
    const target = page.locator('[data-widget-id="tasks-summary"]');

    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await target.boundingBox();

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + 10, targetBox.y + targetBox.height / 2, { steps: 5 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    await page.waitForTimeout(200);

    await page.reload();
    await page.waitForSelector('#widget-container');

    const widgets = page.locator('.widget-panel');
    const widgetIds = await widgets.evaluateAll(elements =>
      elements.map(el => el.dataset.widgetId)
    );

    expect(widgetIds).toEqual(['priority-chart', 'tasks-summary', 'status-overview']);
  });

  test('keyboard arrow keys can reorder widgets', async ({ page }) => {
    const firstWidget = page.locator('[data-widget-id="tasks-summary"]');

    await firstWidget.focus();
    await page.keyboard.press('ArrowDown');

    await page.waitForTimeout(100);

    const widgets = page.locator('.widget-panel');
    const widgetIds = await widgets.evaluateAll(elements =>
      elements.map(el => el.dataset.widgetId)
    );

    expect(widgetIds).toEqual(['priority-chart', 'tasks-summary', 'status-overview']);
  });
});
