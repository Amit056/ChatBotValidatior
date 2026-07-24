import { browser } from 'k6/browser';
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
    //
    scenarios: {

        ui: {
            executor: 'shared-iterations',
            vus: 8,
            exec: 'loginIntoACI',
            maxDuration: '1m',
            iterations: 16,
            options: {
                browser: {
                    type: 'chromium',
                    headless: true,
                },
            },
        },



        backend: {
            exec: 'backgroundTask',
            executor: 'constant-vus',
            vus: 20,
            duration: '1m',
        }
    },
    thresholds: {
        checks: ['rate>0.95'],
    }
}



export async function loginIntoACI() {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://skills.stg-myaci.acilearning.com/');
    console.log('✅ Navigated to ACI Skills page');
    await page.locator('[data-testid="email-username"]').fill('adminuser0204150637');
    console.log('✅ Filled in the username');
    await page.locator('[data-testid="password"]').fill('aci@12345678');
    console.log('✅ Filled in the password');
    await page.locator('[data-testid="submitlogin"]').click();
    console.log('✅ Clicked the sign in button');
    const ele = await page.locator('[class="MuiTypography-root MuiTypography-h1 css-1h6c3yw"]').first();
    await ele.waitFor({ state: 'visible', timeout: 50000 });
    const landingPageText = await ele.textContent();

    console.log('✅ Landing page text:', landingPageText);

    check(landingPageText, {
        'Login successful': (text) => text?.trim().includes('Welcome')
    });
}

export async function backgroundTask() {
    const res = await http.get('https://auth.stg-myaci.acilearning.com/');
    check(res, {
        'status is 200': (r) => r.status === 200,
    });

}