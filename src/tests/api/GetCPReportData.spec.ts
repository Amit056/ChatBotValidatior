import { test, expect } from '@playwright/test';
import { buildGetCPReportPayload } from '../../payload/getCPReportData.payload';


test.only('GetCPReportData - stable API test', async ({ request }) => {
  const url = `${process.env.API_BASE_REPORTS_URL}/graphql`;
  const payload = await buildGetCPReportPayload(request);
  const response = await request.post(url, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `${process.env.API_TOKEN}`, // ✅ best practice
      'org-id': `${process.env.ORGANIZATION_ID}`,
      'user-id': `${process.env.TEACHER_ID}`
    },
    data: payload
  });

  
  // ✅ Parse response
  const body = await response.json();
  const formatted = JSON.stringify(body, null, 2);
  // console.log(formatted);
  console.log(formatted);

  expect(response.status()).toBe(200);
  // await expect(body.data.getCPReportData).toBeTruthy();
  expect(body.data.getCPReportData.cpReportData.organizationName).toBe('SM Regression Basic Flex School');
  expect(body.data.getCPReportData.cpReportData.teacherInfo.id).toBe(process.env.TEACHER_ID);
  expect(body.data.getCPReportData.cpReportData.totalNoOfRows).toBeGreaterThan(0);
  expect(response).toBeOK();

});

test('GetCPReportData - stable API test with invalid organization ID', async ({ request }) => {
  const url = `${process.env.API_BASE_REPORTS_URL}/graphql`;
  const payload = await buildGetCPReportPayload(request, { organizationId: 'invalid-org-id' });
  const response = await request.post(url, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `${process.env.API_TOKEN}`, // ✅ best practice
      'org-id': `${process.env.ORGANIZATION_ID}`,
      'user-id': `${process.env.TEACHER_ID}`
    },
    data: payload
  });

  // ✅ Parse response
  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
  // ✅ Check GraphQL error
  expect(body.errors).toBeTruthy();
  expect(body.errors[0].message).toContain('Invalid value passed for Organization Id');

  expect(body.errors[0].extensions.code).toContainEqual('400');

  // Optional: check error code
  expect(body.errors[0].extensions.code).toBe('400');
});

test('GetCPReportData - stable API test with invalid teacher ID', async ({ request }) => {
  const url = `${process.env.API_BASE_REPORTS_URL}/graphql`;
  const payload = await buildGetCPReportPayload(request, { id: 'invalid-teacher-id' });
  const response = await request.post(url, {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `${process.env.API_TOKEN}`, // ✅ best practice
      'org-id': `${process.env.ORGANIZATION_ID}`,
      'user-id': `${process.env.TEACHER_ID}`
    },
    data: payload
  });

  // ✅ Parse response
  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
  // ✅ Check GraphQL error
  expect(body.errors).toBeTruthy();
  // expect(body.errors[0].message).toContain('Invalid value passed for Teacher Id');

  // Optional: check error code
  expect(body.errors[0].message).toBe('400: Bad Request');
});