import { check, sleep, group } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { ENV_CONFIG } from '../config/env.js';

// ✅ Load users
const users = new SharedArray('users', function () {
  return JSON.parse(open('../data/users.json'));
});

if (!users || users.length === 0) {
  throw new Error('❌ users.json is empty or not loaded');
}

// ✅ Environment
const ENV = __ENV.ENV || 'stage';
const CONFIG = ENV_CONFIG[ENV];

if (!CONFIG) {
  throw new Error(`❌ Invalid ENV: ${ENV}`);
}

// ✅ Options
export let options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.95'],
  },
};

export default function () {

  const user = users[0];

  const email_or_username = user.email_or_username;
  const password = user.password;
  const user_id = user.user_id;
  const platform_key = user.platform_key;

  console.log(`👤 User: ${email_or_username}`);

  let csrfToken, token, authHeaders;

  // 🔐 AUTH FLOW
  group('🔐 Authentication Flow', function () {

    let csrfRes = http.get(`${CONFIG.BASE_URL}/csrf/api/v1/token`, {
      headers: {
        Origin: CONFIG.AUTH_URL,
        Referer: CONFIG.AUTH_URL + '/',
      },
    });

    console.log(`CSRF Status: ${csrfRes.status}`);
    console.log(`CSRF Body: ${csrfRes.body}`);

    csrfToken = csrfRes.json('csrfToken');

    if (!csrfToken) {
      throw new Error('❌ CSRF token not found');
    }

    let loginRes = http.post(
      `${CONFIG.BASE_URL}/api/user/v2/account/login_session/`,
      {
        email_or_username,
        password,
      },
      {
        headers: {
          'X-CSRFToken': csrfToken,
          Origin: CONFIG.AUTH_URL,
          Referer: CONFIG.AUTH_URL + '/',
        },
      }
    );

    check(loginRes, {
      'login success': (r) => r.status === 200,
    });

    let tokenRes = http.post(
      `${CONFIG.BASE_URL}/api/ibl/manager/consolidated-token/proxy/`,
      {
        platform_key,
      },
      {
        headers: {
          'X-CSRFToken': csrfToken,
          Origin: CONFIG.AUTH_URL,
          Referer: CONFIG.AUTH_URL + '/',
        },
      }
    );

    console.log(`Token Body: ${tokenRes.body}`);

    token = tokenRes.json('data.dm_token.token');

    if (!token) {
      throw new Error('❌ Token not found');
    }

    authHeaders = {
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
      },
    };
  });

  // 📊 Catalog APIs
  group('📊 Catalog APIs', function () {

    let licenseRes = http.get(
      `${CONFIG.FINAL_URL}/api/catalog/licenses/expiration/check/?user_id=${user_id}&platform_id=${platform_key}`,
      authHeaders
    );

    check(licenseRes, { 'license success': (r) => r.status === 200 });

    let favRes = http.get(
      `${CONFIG.FINAL_URL}/api/catalog/v2/favourite/list/?user_id=${user_id}&page_size=10&page=1`,
      authHeaders
    );

    check(favRes, { 'favourite success': (r) => r.status === 200 });

    let pathwaysRes = http.get(
      `${CONFIG.FINAL_URL}/api/catalog/v2/pathways/favourites/?user_id=${user_id}&page_size=5&page=1`,
      authHeaders
    );

    check(pathwaysRes, { 'pathways success': (r) => r.status === 200 });
  });

  // 📚 Bookmark Courses
  group('📚 Bookmark Courses', function () {

    let bookmarkRes = http.get(
      `${CONFIG.FINAL_URL}/api/catalog/v2/bookmark/courses/?user_id=${user_id}&page_size=12&page=1`,
      authHeaders
    );

    let data = bookmarkRes.json();

    check(bookmarkRes, {
      'bookmark success': (r) => r.status === 200,
      'bookmark valid': () => data.results !== undefined,
    });

    if (data.results?.length) {
      data.results.forEach((c, i) => {
        console.log(`📚 Course ${i + 1}: ${c.course_name}`);
      });
    }
  });

  // 📖 Pathways Bookmark
  group('📖 Pathways', function () {

    let pathwaysRes = http.get(
      `${CONFIG.FINAL_URL}/api/catalog/v2/bookmark/pathways/?user_id=${user_id}&page_size=12&page=1`,
      authHeaders
    );

    let data = pathwaysRes.json();

    check(pathwaysRes, {
      'pathways success': (r) => r.status === 200,
      'pathways valid': () => data.results !== undefined,
    });
  });

  // 📈 Analytics
  group('📈 Analytics API', function () {

    let payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      url: 'https://skills.stg-myaci.acilearning.com/favourites',
      count: 60,
      org: platform_key,
    });

    let res = http.post(
      `${CONFIG.FINAL_URL}/api/analytics/v2/orgs/${platform_key}/time/update/`,
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

// 📊 Report
export function handleSummary(data) {
  return {
    "k6-report.html": htmlReport(data),
    "summary.json": JSON.stringify(data, null, 2),
  };
}