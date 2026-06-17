import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


export const options = {
    vus: 5,
    duration: '30s',

    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01']
    }
};

const BASE_URL =
    'https://af-uniknow-backend-staging.niceforest-1cf40758.centralindia.azurecontainerapps.io';

export default function () {

    // ==========================================
    // Create Session
    // ==========================================

    const sessionPayload = JSON.stringify({
        email: null,
        mobile: null
    });

    const sessionRes = http.post(
        `${BASE_URL}/widget/session`,
        sessionPayload,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    check(sessionRes, {
        'Session Created': (r) => r.status === 200
    });

    const sessionToken = sessionRes.json().session_token;

    console.log(`Session Token: ${sessionToken}`);

    // ==========================================
    // Chat Request
    // ==========================================

    const chatPayload = JSON.stringify({
        message: 'How do I apply for admission to the university?'
    });

    const chatRes = http.post(
        `${BASE_URL}/widget/chat`,
        chatPayload,
        {
            headers: {
                'Content-Type': 'application/json',
                'x-session-token': sessionToken
            }
        }
    );

    check(chatRes, {
        'Chat Status 200': (r) => r.status === 200,
        'Chat Success': (r) => r.json().status === 'SUCCESS',
        'Response Present': (r) => r.json().response && r.json().response.length > 0,
        'Response should not contain error': (r) => !r.json().response.toLowerCase().includes('error')
        
    });

    const body = chatRes.json();

    console.log('==============================');
    console.log(`Status: ${body.status}`);
    console.log(`Response: ${body.response}`);
    console.log('==============================');

    if (body.citations) {
        body.citations.forEach((citation, index) => {
            console.log(
                `Citation ${index + 1}: ${citation.filename}`
            );
        });
    }

    sleep(1);
}


// 📊 Report
export function handleSummary(data) {
  return {
    "k6-report.html": htmlReport(data),
    "summary.json": JSON.stringify(data, null, 2),
  };
}