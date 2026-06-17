import http from 'k6/http';
import { check, sleep } from 'k6';

const SSO_BASE = 'https://nightly-sso.rumba.pk12ls.com';
const LMS_URL = 'https://mt-regression.smdemo.info';

export default function () {

  console.log('🚀 Starting CAS Flow');

  // 🔹 Step 1: Get login page
  let loginPage = http.get(
    `${SSO_BASE}/sso/login?service=${encodeURIComponent(LMS_URL + '/lms/sso.view')}&k12int=true&profile=eb`
  );

  console.log(`Login Page Status: ${loginPage.status}`);

  // 🔥 Extract ALL hidden inputs
  let hiddenFields = {};  
  let regex = /<input type="hidden" name="([^"]+)" value="([^"]*)"/g;

  let match;
  while ((match = regex.exec(loginPage.body)) !== null) {
    hiddenFields[match[1]] = match[2];
  }

  console.log(`Hidden Fields: ${JSON.stringify(hiddenFields)}`);

  // ❌ If empty → JS-based login
  if (Object.keys(hiddenFields).length === 0) {
    console.error('❌ No hidden fields found → JS login / unsupported by k6');
    return;
  }

  // 🔹 Step 2: Login POST
  let payload = {
    username: 'smregtestsch5t2',
    password: 'testing123$',
    _eventId: 'submit',
    ...hiddenFields,
  };

  let loginRes = http.post(
    `${SSO_BASE}/sso/login?service=${encodeURIComponent(LMS_URL + '/lms/sso.view')}&k12int=true&profile=eb`,
    payload,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirects: 0,
    }
  );

  console.log(`Login Status: ${loginRes.status}`);

  let redirectUrl = loginRes.headers['Location'];
  console.log(`Redirect URL: ${redirectUrl}`);

  // 🔹 Extract ST
  let stMatch = redirectUrl && redirectUrl.match(/ticket=(ST-[^&]+)/);

  if (!stMatch) {
    console.error('❌ ST not found → login failed');
    console.log(loginRes.body);
    return;
  }

  let serviceTicket = stMatch[1];
  console.log(`✅ ST Token: ${serviceTicket}`);

  // 🔹 Step 3: Use ticket
  let ssoRes = http.get(`${LMS_URL}/lms/sso.view?ticket=${serviceTicket}`);

  console.log(`SSO Status: ${ssoRes.status}`);

  check(ssoRes, {
    'SSO success': (r) => r.status === 200,
  });

  sleep(1);
}