import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'https://quickpizza.grafana.com';
const PASSWORD = 'securepassword123';

// Random username generator
function randomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// Test configuration
export const options = {
    vus: 5,
    duration: '10s',
};

export default function () {

    const USERNAME = `rahulshetty1${randomString(7)}1`;

    // ---------------- REGISTER ----------------
    group('user registration', function () {
        const registerPayload = JSON.stringify({
            username: USERNAME,
            password: PASSWORD
        });

        const registerResp = http.post(
            `${BASE_URL}/api/users`,
            registerPayload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const success = check(registerResp, {
            'registration status is 201': (r) => r.status === 201 || r.status === 200
        });

        if (success) {
            console.log(`User registered: ${USERNAME}`);
        } else {
            console.log(`Registration failed: ${USERNAME}`);
        }

        sleep(1);
    });

    // ---------------- LOGIN ----------------
    group('user login', function () {
        const loginPayload = JSON.stringify({
            username: USERNAME,
            password: PASSWORD
        });

        const loginResp = http.post(
            `${BASE_URL}/api/users/token/login`,
            loginPayload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const success = check(loginResp, {
            'login status is 200': (r) => r.status === 200
        });

        if (success) {
            const token = loginResp.json('token'); // adjust key if different
            console.log(`User logged in: ${USERNAME}`);
            console.log(`Token: ${token}`);
        } else {
            console.log(`Login failed: ${USERNAME}`);
        }

        sleep(1);
    });
}