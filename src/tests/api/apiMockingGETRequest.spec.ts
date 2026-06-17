import { test, expect } from '@playwright/test';

test('mock users API', async ({ page }) => {

  await page.route('**/api/users', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Alice' }
        ]
      })
    });
  });

  await page.goto('https://example.com');

  // Trigger API call from UI
  await page.click('button#getUsers');

  // Assertions
  await expect(page.locator('.user-name')).toContainText('John');
});