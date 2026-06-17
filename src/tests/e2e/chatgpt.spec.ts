import { test, expect } from '@playwright/test';

test('open google and check title', async ({ page, context }) => {
  await context.grantPermissions([]);
  await page.goto('https://www.chatgot.io/chat/?utm_source=chatgot_www');
   await page.waitForTimeout(5000);
  const inputQuery = "What is TypeScript?";
    // Wait for and click the "Accept all" button
 await page.locator(`[aria-owns="quill-mention-list"]`).fill(inputQuery);
  await page.waitForTimeout(5000); // wait for 5 seconds to see the page

    // await expect(page.locator('text=Report Name:')).toHaveAttribute('aria-label', 'Report Name:');
    // await expect(page.locator('text=Report Name:')).toHaveCSS('color', 'rgb(0, 0, 0)'); // replace with actual color
    // await expect(page.locator('text=Report Name:')).toHaveClass(/some-css-class/); // replace with actual class
});