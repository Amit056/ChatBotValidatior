import { APIRequestContext } from '@playwright/test';

export async function getStudentIds(request: APIRequestContext,bearerToken: string, orgId: string,teacherId: string
) {
  const response = await request.post(
    `${process.env.API_BASE_TEACHER_URL}/graphql?op=GetOrgStudent`,
    {
      headers: {
        'authorization': bearerToken,
        'content-type': 'application/json',
        'org-id': orgId,
        'user-id': teacherId
      },
      data: {
        operationName: 'GetOrgStudent',
        variables: { groupId: "" },
        query: `query GetOrgStudent($groupId: String) {
          getOrgStudent(groupId: $groupId) {
            data { studentId }
          }
        }`
      }
    }
  );

  const body = await response.json();
  return body.data.getOrgStudent.data.map((s: any) => s.studentId);
}