import { test, expect } from '@playwright/test';


test('should return a successful response from the Uniknow API', async ({ request }) => {

  console.log('Base URL:', process.env.UNIKNOW_BASE_URL);
  const response = await request.post(`${process.env.UNIKNOW_BASE_URL}/widget/session`, {

    data: {}

  });

  const responseBody = await response.json();

  expect(response.status()).toBe(200);
  expect(responseBody).toHaveProperty('session_token');
  const sessionToken = responseBody.session_token;


  const resp = await request.post(`${process.env.UNIKNOW_BASE_URL}/auth/token`, {
    form: {
      username: process.env.UNIKNOW_USERNAME!,
      password: process.env.UNIKNOW_PASSWORD!,
    },
  }
  );

  const respBody = await resp.json();
  console.log('Response Body:', respBody);

  expect(resp.status()).toBe(200);
  expect(respBody).toHaveProperty('access_token');
  const accessToken = respBody.access_token;


  const unanswerdRes = await request.get(
    `${process.env.UNIKNOW_BASE_URL}/admin/unanswered`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page: 1,
        page_size: 20,
        sort_by: "timestamp",
        sort_order: "desc",
      },
    }
  );

  console.log("Status:", unanswerdRes.status());
  console.log(await unanswerdRes.text());

  expect(unanswerdRes.status()).toBe(200);
  const unanswerdResBody = await unanswerdRes.json();
  expect(unanswerdResBody.total).toBeGreaterThanOrEqual(158);
  expect(unanswerdResBody.status_counts.pending).toBeGreaterThanOrEqual(148);
  expect(unanswerdResBody.items.length).toBeGreaterThanOrEqual(20);
  expect(unanswerdResBody.items[0]).toContainText("timestamp");
});