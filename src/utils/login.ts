import { Page, expect } from '@playwright/test';

export async function loginAsTeacher(page: Page, username: string, password: string) {
  await page.getByLabel(`Username`).and(page.locator('input')).fill(username);
  await page.getByLabel(`Password`).and(page.locator('input')).fill(password);

  await page.getByRole('button', { name: 'Sign in' }).click();

  // Validate successful login (adjust selector if needed)
 
await  page.getByRole('link', { name: /Home/i })
    .waitFor({ state: 'visible', timeout: 120000 });

}