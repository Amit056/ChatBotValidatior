import { test, expect } from '../../fixture/pageFixture';
import { loginAsTeacher } from '../../utils/login';

test.describe('Cumulative Performance Report', () => {
  test('should launch application, login, and run cumulative performance report for Reading subject', async ( {page}) => {

    if (!process.env.BASEURL) {
      throw new Error('Missing required environment variable: BASEURL');
    }


    // Navigate to the application URL
    await page.goto(process.env.BASEURL);

    // Perform login using predefined method
    await loginAsTeacher(page, process.env.TEACHER_USERNAME, process.env.TEACHER_PASSWORD);

    // Verify navigation to Reports section
    await expect(page.getByRole('link', { name: /reports/i })).toBeVisible();
    await page.getByRole('link', { name: /reports/i }).click();

    // Verify Cumulative Performance Report is visible and accessible
    // await expect(page.getByRole('link', { name: /cumulative performance report/ })).toBeVisible();

    const reportsIFrame =  page.frameLocator(`[id="reportsIFrame"]`);
    
    await reportsIFrame.getByRole('button', { name: /Cumulative Performance/ }).click();

    // Verify Subject dropdown is visible
    await expect(page.getByRole('combobox', { name: /subject/i })).toBeVisible();

    // Select Reading from the Subject dropdown
    await page.getByRole('combobox', { name: /subject/i }).click();
    await expect(page.getByRole('option', { name: /reading/i })).toBeVisible();
    await page.getByRole('option', { name: /reading/i }).click();

    // Verify Reading is selected
    await expect(page.getByRole('combobox', { name: /subject/i })).toContainText(/reading/i);

    // Click on the Run button to execute the report
    await expect(page.getByRole('button', { name: /run/i })).toBeVisible();
    await page.getByRole('button', { name: /run/i }).click();

    // Verify the report has been executed (wait for results to load)
    await expect(page.getByRole('heading', { name: /report|results|data/i })).toBeVisible({ timeout: 5000 });
  });
});
