import { test } from '@playwright/test';

test('abort API request', async ({ page }) => {

  await page.route('**/api/users', async (route) => {
    await route.abort();
  });

  await page.goto('https://example.com');
});