import { test, expect } from '@playwright/test';

test('Download PDF using Promise.all', async ({ page }) => {
  await page.goto('https://example.com');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('text=Download PDF').click()
  ]);

  // Verify file name
  expect(download.suggestedFilename()).toContain('.pdf');

  // Save the file
  await download.saveAs(`downloads/${download.suggestedFilename()}`);

  // Verify download was successful
  expect(await download.failure()).toBeNull();

  console.log(await download.path());
});