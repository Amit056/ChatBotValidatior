import { test as base, Browser, BrowserContext, Page, expect } from '@playwright/test';
import { invokeBrowser } from '../helper/browsers/browserManager';
import { getEnv } from '../helper/env/env';
import { CommonUtils } from '../utils/uiCommonUtil/commonUtils.ts';

type MyFixtures = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  commonUtils:CommonUtils;
};

export const test = base.extend<MyFixtures>({
  // =========================================
  // Browser Fixture (One browser per worker)
  // =========================================
  browser: [
    async ({ }, use) => {
      const browser = await invokeBrowser();
      await use(browser);   // <-- Control goes to the tests
      await browser.close(); //  This line executes only after the tests are finished
    },
    { scope: 'worker' },
  ],

  // =========================================
  // Context Fixture (One context per test)
  // =========================================
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: null,

      recordVideo: {
        dir: 'test-results/videos',
        size: {
          width: 1920,
          height: 1080,
        },
      },
    });

    await use(context);
    // await context.close();
  },

  // =========================================
  // Page Fixture (One page per test)
  // =========================================
  page: async ({ context }, use, testInfo) => {
    const page = await context.newPage();

    await use(page);
    const pageName = page.url();

    // Attach screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {

      await testInfo.attach(`Failure Screenshot : ${pageName}`, {
        body: await page.screenshot({fullPage: true}),
        contentType: 'image/png',
      });
    }

    // Save video object before context closes
    const video = page.video();

    // Do NOT call page.close().
    // context.close() will automatically close it.

    const shouldAttach = video && testInfo.status !== testInfo.expectedStatus;
    await context.close();

    if (shouldAttach) {
      await testInfo.attach(`Execution Video : ${pageName}`, {
        path: await video.path(),
        contentType: "video/webm",
      });
    }
  },

  commonUtils: async({page},use,testInfo) =>{

    await use(new CommonUtils(page));
  }
});

// =========================================
// Hooks
// =========================================

// Before all tests
test.beforeAll(async () => {
  console.log('\n========================================');
  console.log('🚀 Test Execution Started');
  console.log(`Environment : ${process.env.ENV}`);
  console.log(`Browser     : ${process.env.BROWSER}`);
  console.log(`Started At  : ${new Date().toLocaleString()}`);
  console.log('========================================\n');
});

// Before every test
test.beforeEach(async ({ page }, testInfo) => {
  console.log('\n----------------------------------------');
  console.log(`▶ Starting Test : ${testInfo.title}`);
  console.log(`Retry           : ${testInfo.retry}`);
  console.log('----------------------------------------');

  // Example:
  // await page.goto(process.env.BASE_URL!);
});

// After every test
test.afterEach(async ({ }, testInfo) => {
  console.log('\n----------------------------------------');
  console.log(`✔ Finished Test : ${testInfo.title}`);
  console.log(`Status          : ${testInfo.status}`);
  console.log(`Duration        : ${testInfo.duration} ms`);
  console.log('----------------------------------------');
});

// After all tests
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('🏁 Test Execution Finished');
  console.log(`Completed At : ${new Date().toLocaleString()}`);
  console.log('========================================\n');
});

export { expect };
