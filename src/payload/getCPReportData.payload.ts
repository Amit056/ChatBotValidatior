import { getGroupIds } from '../utils/apiHelper/getGroupIds';
import { getStudentIds } from '../utils/apiHelper/getStudentId';

// export async function buildGetCPReportPayload(request: any, overrides = {}) {

//   const payload = {
//     operationName: 'GetCPReportData',

//     variables: {
//       id: process.env.TEACHER_ID,
//       organizationId: process.env.ORGANIZATION_ID,
//       subject: 2,
//       isGroupSelected: true,

//       studentIds: await getStudentIds(
//         request,
//         `${process.env.API_TOKEN}`,
//         `${process.env.ORGANIZATION_ID}`,
//         `${process.env.TEACHER_ID}`
//       ),

//       groupIds: await getGroupIds(request, {
//         orgId: `${process.env.ORGANIZATION_ID}`,
//         teacherId: `${process.env.TEACHER_ID}`,
//         token: `${process.env.API_TOKEN}`
//       }),

//       limit: 50,
//       offset: 0
//     },

//     query: `
//     query GetCPReportData($organizationId: String!, $id: String!) {
//       getCPReportData(
//         organizationId: $organizationId
//         id: $id
//       ) {
//         reportRun
//         cpReportData {
//           totalNoOfRows
//           rows {
//             firstName
//             lastName
//             middleName
//             userName
//             groupName
//             groupId
//             grade
//             personId
//             assignmentId
//             courseName
//             ipmStatusId
//             contentTypeBaseId
//             assignedLevel
//             currentCourseLevel
//             ipmEndLevel
//             ipmDoneInRange
//             totalTime
//             totalSessions
//             totalExercisesCorrect
//             totalExercisesAttempted
//             totalSkillsMastered
//             totalSkillsCompleted
//             ipmGain
//             exercisesPercentCorrect
//             skillsPercentMastered
//             formattedTotalTime
//             formattedCurrentCourseLevel
//             formattedIpmEndLevel
//             formattedTotalSkillsMastered
//             formattedTotalSkillsCompleted
//             sisUserId
//           }
//         }
//       }
//     }
//     `
//   };

//   // ✅ Apply overrides BEFORE return
//   payload.variables = {
//     ...payload.variables,
//     ...overrides   // overrides must be LAST
//   };

//   return payload;
// }



export async function buildGetCPReportPayload(request: any, overrides = {}) {

  const studentIds = (await getStudentIds(
    request,
    `${process.env.API_TOKEN}`,
    `${process.env.ORGANIZATION_ID}`,
    `${process.env.TEACHER_ID}`
  )).filter((id: string | null) => id !== null);

  const groupIds = await getGroupIds(request, {
    orgId: `${process.env.ORGANIZATION_ID}`,
    teacherId: `${process.env.TEACHER_ID}`,
    token: `${process.env.API_TOKEN}`
  });

  const payload = {
    operationName: 'GetCPReportData',

    variables: {
      teacherId: process.env.TEACHER_ID,
      organizationId: process.env.ORGANIZATION_ID,
      subject: 1,
      isGroupSelected: true,
      studentIds,
      groupIds,

      // Add if required by API
      assignmentIds: [],

      limit: 50,
      offset: 0

    },

    query: `
      query GetCPReportData(
        $organizationId: String!,
        $teacherId: String!,
        $isGroupSelected: Boolean,
        $subject: Float,
        $studentIds: [String!],
        $assignmentIds: [Float!],
        $limit: Float,
        $offset: Float,
        $groupIds: [String!]
      ) {

        getCPReportData(
          organizationId: $organizationId
          id: $teacherId
          isGroupSelected: $isGroupSelected
          subject: $subject
          studentIds: $studentIds
          assignmentIds: $assignmentIds
          limit: $limit
          groupIds: $groupIds
          offset: $offset
        ) {

          reportRun

          cpReportData {

            totalNoOfRows

            teacherInfo {
              id
              title
              firstName
              lastName
              userName
              __typename
            }

            organizationName

            rows {
              firstName
              lastName
              middleName
              userName
              groupName
              groupId
              grade
              personId
              assignmentId
              courseName
              ipmStatusId
              contentTypeBaseId
              assignedLevel
              currentCourseLevel
              ipmEndLevel
              ipmDoneInRange
              totalTime
              totalSessions
              totalExercisesCorrect
              totalExercisesAttempted
              totalSkillsMastered
              totalSkillsCompleted
              ipmGain
              exercisesPercentCorrect
              skillsPercentMastered
              formattedTotalTime
              formattedCurrentCourseLevel
              formattedIpmEndLevel
              formattedTotalSkillsMastered
              formattedTotalSkillsCompleted
              sisUserId
              __typename
            }

            __typename
          }

          __typename
        }
      }
    `
  };

  // Apply overrides dynamically
  payload.variables = {
    ...payload.variables,
    ...overrides
  };

  return payload;
}