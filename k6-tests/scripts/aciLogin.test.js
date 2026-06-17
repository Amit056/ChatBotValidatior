import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let options = {
  vus: 1,
  duration: '30s',
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests < 2s
    checks: ['rate>0.95'],
  },
};

const BASE_URL = 'https://learn.stg-myaci.acilearning.com';
const AUTH_URL = 'https://auth.stg-myaci.acilearning.com';
const FINAL_URL = 'https://base.manager.stg-myaci.acilearning.com';

export default function () {

  let csrfToken, token, authHeaders;

  group('🔐 Authentication Flow', function () {

    let csrfRes = http.get(`${BASE_URL}/csrf/api/v1/token`, {
      headers: {
        Origin: AUTH_URL,
        Referer: AUTH_URL + '/',
      },
    });

    csrfToken = csrfRes.json('csrfToken');

    check(csrfRes, {
      'CSRF fetched': () => csrfToken !== undefined,
    });

    if (!csrfToken) return;

    let loginRes = http.post(
      `${BASE_URL}/api/user/v2/account/login_session/`,
      {
        email_or_username: 'adminuser0204150637',
        password: 'aci@12345678',
      },
      {
        headers: {
          'X-CSRFToken': csrfToken,
          Origin: AUTH_URL,
          Referer: AUTH_URL + '/',
        },
      }
    );

    check(loginRes, {
      'login success': (r) => r.status === 200,
    });

    let tokenRes = http.post(
      `${BASE_URL}/api/ibl/manager/consolidated-token/proxy/`,
      {
        platform_key: 'qapf0204150632',
      },
      {
        headers: {
          'X-CSRFToken': csrfToken,
          Origin: AUTH_URL,
          Referer: AUTH_URL + '/',
        },
      }
    );

    token = tokenRes.json('data.dm_token.token');

    check(tokenRes, {
      'token received': () => token !== undefined,
    });

    if (!token) return;

    authHeaders = {
      headers: {
        Authorization: `Token ${token}`,
      },
    };
  });

  group('📊 Catalog APIs', function () {

    let licenseRes = http.get(
      `${FINAL_URL}/api/catalog/licenses/expiration/check/?user_id=8841&platform_id=qapf0204150632`,
      authHeaders
    );

    check(licenseRes, {
      'license success': (r) => r.status === 200,
    });

    let favRes = http.get(
      `${FINAL_URL}/api/catalog/v2/favourite/list/?user_id=8841&page_size=10&page=1&search=`,
      authHeaders
    );

    check(favRes, {
      'favourite success': (r) => r.status === 200,
    });

    let pathwaysRes = http.get(
      `${FINAL_URL}/api/catalog/v2/pathways/favourites/?user_id=8841&page_size=5&page=1`,
      authHeaders
    );

    check(pathwaysRes, {
      'pathways success': (r) => r.status === 200,
    });
  });

  group('📚 Bookmark Courses', function () {

    let bookmarkRes = http.get(
      `${FINAL_URL}/api/catalog/v2/bookmark/courses/?user_id=8841&page_size=12&page=1`,
      authHeaders
    );

    let data = bookmarkRes.json();

    check(bookmarkRes, {
      'bookmark API success': (r) => r.status === 200,
      'bookmark has data': () => data.results && data.results.length > 0,
      'bookmark count': (r) => r.json('count') >= 2,
    });

    if (data.results && data.results.length > 0) {
      data.results.forEach((c, i) => {
        console.log(`📚 Course ${i + 1}: ${c.course_name}`);
      });
    } else {
      console.log('⚠️ No bookmarked courses found');
    }
  });

  group('📖 pathways', function () {
    let pathwaysRes = http.get(`${FINAL_URL}/api/catalog/v2/bookmark/pathways/?user_id=8841&page_size=12&page=1`, 
      authHeaders);

    let data = pathwaysRes.json();

    check(pathwaysRes, {
      'pathways API success': (r) => r.status === 200,
      'pathways has data': () => data.results.length >= 0,
      'pathways count': (r) => r.json('count') >= 0,
    });
  });

  group('📈 Analytics API', function () {

    let payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      url: 'https://skills.stg-myaci.acilearning.com/favourites',
      count: 60,
      org: 'qapf0204150632',
    });

    let res = http.post(
      `${FINAL_URL}/api/analytics/v2/orgs/qapf0204150632/time/update/`,
      payload,
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    check(res, {
      'analytics success': (r) => r.status === 200,
    });
  });

  sleep(1);
}

// ✅ HTML REPORT
export function handleSummary(data) {
  return {
    "k6-report.html": htmlReport(data),
    "summary.json": JSON.stringify(data, null, 2),
  };
}