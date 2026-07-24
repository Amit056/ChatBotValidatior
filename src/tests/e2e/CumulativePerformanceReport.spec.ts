import { test, expect } from '../../fixture/pageFixture';
import { loginAsTeacher } from '../../utils/login';


test.describe('Cumulative Performance Report', () => {
  test('should launch application, login, and run cumulative performance report for Reading subject @smoke', async ( {page,commonUtils},testInfo) => {

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


    await reportsIFrame.getByLabel('Subject *').selectOption({value:'2'});
    //await page.waitForTimeout(3000);

    // Verify Reading is selected
    await expect(reportsIFrame.getByRole('combobox', { name: /subject/i })).toContainText(/reading/i);

    // Click on the Run button to execute the report
    await expect(reportsIFrame.getByRole('button', { name: /run/i })).toBeVisible();
  

    const [newTab] = await Promise.all([
      page.waitForEvent('popup'),
      reportsIFrame.getByRole('button', { name: /run/i }).click()
    ]);

    // Verify the report has been executed (wait for results to load)
    await expect(newTab.getByRole('heading', { name: /report|results|data/i })).toBeVisible({ timeout: 5000 });
   
    await expect(newTab.getByRole('heading', { name: /report|results|data/i })).toHaveText(/report|results|data/i);
   await commonUtils.getScreenshot( newTab.url(),testInfo,newTab)

   await newTab.getByRole('button',{name:'PDF'}).click();
    const okButton= newTab.getByRole('button',{name:'OK'});
    // await  page.waitForTimeout(10000)

    await commonUtils.downloadFile(okButton,'test-results/downloads',newTab);
    await newTab.getByRole('button',{name:'close'}).click();
  });


});
