import { test, expect } from '@playwright/test';
import { loginAsTeacher } from '../../utils/login';
import { invokeBrowser } from '../../helper/browsers/browserManager';

test('search in Google', async () => {
  const browser = await invokeBrowser();
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  // Validate required environment variables
  if (!process.env.BASEURL) {
    throw new Error('Missing required environment variable: BASEURL');
  }

  // Intercept the API call to /home and check if it matches the criteria for GET_COURSES
  await page.route('**/home', async (route) => {
    //ACCESS THE REQUEST DETAILS
    const request = route.request();

    // Only handle POST
    if (request.method() !== 'POST') {
      return route.continue();
    }
    // Extract the JSON body and headers from the request
    const body = request.postDataJSON();
    const headers = request.headers();

    // Check if the request matches the criteria for the GET_COURSES API
    const isMatch =
      body?.endpoint === 'GET_COURSES' &&
      body?.params?.assignedCourses === false &&
      body?.params?.orgId === '8a72026581a3e1df0181c9c7d10400a1' &&
      headers['org-id'] === '8a72026581a3e1df0181c9c7d10400a1';

    if (isMatch) {
      console.log('✅ Matched GET_COURSES API');

      /**
       * It stops the real API call and instead returns a fake response to your frontend.
       * In this case, it simulates a failure by returning a 400 status code and a JSON body indicating
       *  the error. Your frontend should then handle this response and display an appropriate error message
       *  to the user, which you can verify in your test.
       */
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Failed to fetch courses'
        })
      });
    }

    // For all other requests, continue without modification
    await route.continue();
  });

  await page.waitForTimeout(9000);
  // Navigate to the application URL
  await page.goto(process.env.BASEURL);

  // Perform login using predefined method
  await loginAsTeacher(page, process.env.TEACHER_USERNAME, process.env.TEACHER_PASSWORD);



  const element = await page.getByText(`SM REGRESSION BASIC FLEX SCHOOL`);
  await element.waitFor({ state: 'visible', timeout: 30000 });

  // Verify results page
  await expect(page.getByText(`SOMETHING WENT WRONG`)).toBeVisible();
  await page.waitForTimeout(29000);

});