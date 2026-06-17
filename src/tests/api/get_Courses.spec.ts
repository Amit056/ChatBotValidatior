import { test, expect } from '@playwright/test';

test('GET_USAGEREPORTS API test', async ({ request }) => {
  const url = `${process.env.API_BASE_TEACHER_URL}/home`;

  const response = await request.post(url, {
    headers: {
      'accept': 'application/json, text/plain, */*',
      'authorization': `${process.env.API_TOKEN}`,
      'content-type': 'application/json',
      'org-id': `${process.env.ORGANIZATION_ID}`,
      'user-id': `${process.env.TEACHER_ID}`
    },
    data: {
      endpoint: 'GET_USAGEREPORTS',
      params: {
        orgId: `${process.env.ORGANIZATION_ID}`,
        staffId: `${process.env.TEACHER_ID}`
      },
      httpMethod: 'POST',
      requestBody: {
        assignmentIds: []
      }
    }
  });

  // Assertions
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  console.log(responseBody.data);

  // Example validation (adjust based on actual response)
  expect(responseBody).toHaveProperty('success');
});