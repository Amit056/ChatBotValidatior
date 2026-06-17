import { test, expect } from '@playwright/test';

test('MasteryPerformance GraphQL API test', async ({ request }) => {
  const url = `${process.env.API_BASE_MASTERY_URL}/graphql`;
  

  const response = await request.post(url, {
    headers: {
      'authorization': `${process.env.API_TOKEN}`,
      'org-id': `${process.env.ORGANIZATION_ID}`,
      'user-id': `${process.env.TEACHER_ID}`
      
    },
    data: {
      operationName: 'MasteryPerformance',
      variables: {
        limit: 3,
        subjectId: 1
      }, 
      query: `
        query MasteryPerformance($assignmentIds: [Int!], $limit: Int, $standardId: Int, $subjectId: Int!) {
          masteryPerformanceDetails(
            subjectId: $subjectId
            assignmentIds: $assignmentIds
            standardId: $standardId
            limit: $limit
          ) {
            topPerformers {
              id
              title
              masteryPercent
            }
            lowPerformers {
              id
              title
              masteryPercent
            }
            studentIds
          }
        }
      `
    }
  });

  // ✅ Basic assertions
  expect(response.status()).toBe(200);

  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));

  // ✅ GraphQL-specific assertions
  expect(body).not.toHaveProperty('errors');

  expect(body.data.masteryPerformanceDetails).toBeDefined();
  expect(body.data.masteryPerformanceDetails.topPerformers.length).toBeGreaterThan(0);
});