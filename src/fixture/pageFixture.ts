import { test as base, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { invokeBrowser } from '../helper/browsers/browserManager';

type MyFixtures = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
};

export const test = base.extend<MyFixtures>({

  // Browser created once per worker
  browser: [async ({}, use) => {
    const browser = await invokeBrowser();

    await use(browser);

    await browser.close();
  }, { scope: 'worker' }],

  // New context for every test
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: null
    });

    await use(context);

    await context.close();
  },

  // New page for every test
  page: async ({ context }, use) => {
    const page = await context.newPage();

    await use(page);

    await page.close();
  }
});
// Export expect for use in tests
export { expect };