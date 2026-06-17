import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    duration: '1m',

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

const BASE_URL =
    'https://af-uniknow-backend-staging.niceforest-1cf40758.centralindia.azurecontainerapps.io';

export default function () {

    // ==========================
    // 1. Login
    // ==========================
    const loginPayload =
        `username=${__ENV.USERNAME}&password=${__ENV.PASSWORD}`;

    const loginHeaders = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const loginRes = http.post(
        `${BASE_URL}/auth/token`,
        loginPayload,
        loginHeaders
    );

    check(loginRes, {
        'Login Successful': (r) => r.status === 200,
    });

    const token =
        loginRes.json('access_token') ||
        loginRes.json('token');

    const authHeaders = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    // ==========================
    // 2. User Info
    // ==========================
    const meRes = http.get(
        `${BASE_URL}/auth/me`,
        authHeaders
    );

    check(meRes, {
        'auth/me success': (r) => r.status === 200,
    });

    // ==========================
    // 3. UI Config
    // ==========================
    const uiConfigRes = http.get(
        `${BASE_URL}/ui-config`,
        authHeaders
    );

    check(uiConfigRes, {
        'ui-config success': (r) => r.status === 200,
    });

    // ==========================
    // 4. Admin APIs
    // ==========================
    const responses = http.batch([
        [
            'GET',
            `${BASE_URL}/admin/ui-config`,
            null,
            authHeaders,
        ],
        [
            'GET',
            `${BASE_URL}/admin/overview`,
            null,
            authHeaders,
        ],
        [
            'GET',
            `${BASE_URL}/admin/activity`,
            null,
            authHeaders,
        ],
    ]);

    responses.forEach((res) => {
        check(res, {
            'Admin API success': (r) => r.status === 200,
        });
    });

    // ==========================
    // 5. Chat API
    // ==========================
    const chatPayload = JSON.stringify({
        message: 'tell me about student policies',
        session_id: `session-${__VU}-${__ITER}`,
    });

    const chatRes = http.post(
        `${BASE_URL}/chat`,
        chatPayload,
        authHeaders
    );

    check(chatRes, {
        'Chat Success': (r) => r.status === 200,
    });

    sleep(1);
}