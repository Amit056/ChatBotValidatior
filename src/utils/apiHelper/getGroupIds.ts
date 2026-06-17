import { APIRequestContext } from '@playwright/test';

type GetGroupIdsParams = {
  orgId: string;
  teacherId: string;
  token: string;
  studentIds?: string[]; // optional
};

export async function getGroupIds(request: APIRequestContext,params: GetGroupIdsParams): Promise<string[]> {

  const { orgId, teacherId, token, studentIds = [] } = params;

  const response = await request.post(
    `${process.env.API_BASE_TEACHER_URL}/graphql?op=GetGroups`,
    {
      headers: {
        'authorization': params.token,
        'content-type': 'application/json',
        'org-id': params.orgId,
        'user-id': params.teacherId
      },
      data: {
        operationName: 'GetGroups',
        variables: { studentIds },
        query: `query GetGroups($studentIds: [String!]) {
          getGroups(studentIds: $studentIds) {
            data {
              groupId
            }
          }
        }`
      }
    }
  );

  if (!response.ok()) {
    throw new Error(`API failed with status ${response.status()}`);
  }

  const body = await response.json();

  const groups = body?.data?.getGroups?.data || [];

  return groups.map((g: any) => g.groupId);
}