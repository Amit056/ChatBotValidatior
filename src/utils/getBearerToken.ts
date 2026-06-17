export async function generateBearerToken(request: any): Promise<string> {
  // 🔹 STEP 1: Login → get CASTGC
  const loginResponse = await request.post(
    'https://rr-auth-gateway.nightly.savvasrealizedev.com/sapi/account/v2/login',
    {
      headers: {
        'content-type': 'application/json'
      },
      data: {
        serviceUrl: 'https://sm-teacher-mfe-stage.smdemo.info/auth-callback',
        includeLicensedProducts: true,
        token: 'ST-XXXX-REPLACE', // ⚠️ must be fresh
        authContextId: '218685',
        includePolicy: false
      }
    }
  );

  if (!loginResponse.ok()) {
    throw new Error(`Login failed: ${loginResponse.status()} - ${await loginResponse.text()}`);
  }

  // 🔥 Extract CASTGC from set-cookie
  const setCookie = loginResponse.headers()['set-cookie'];

  if (!setCookie) {
    throw new Error('No set-cookie header found in login response');
  }

  const castgcMatch = setCookie.match(/CASTGC=([^;]+)/);

  if (!castgcMatch) {
    throw new Error('CASTGC not found in cookies');
  }

  const castgc = castgcMatch[1];

  // 🔹 STEP 2: Use CASTGC → get Bearer token
  const tokenResponse = await request.post(
    'https://rr-auth-gateway.nightly.savvasrealizedev.com/sapi/oauth/token',
    {
      headers: {
        'content-type': 'application/json',
        'castgc': castgc
      },
      data: {
        userId: 'ffffffff62c3041317280f0030c45057',
        scope: 'rbs',
        clientId: 'pMwx0J32bl1JGR9W1HStzn9zTuHgrSb',
        grant_type: 'custom_castgc'
      }
    }
  );

  if (!tokenResponse.ok()) {
    throw new Error(`Token API failed: ${tokenResponse.status()} - ${await tokenResponse.text()}`);
  }

  const tokenBody = await tokenResponse.json();

  if (!tokenBody.access_token) {
    throw new Error(`No access_token in response: ${JSON.stringify(tokenBody)}`);
  }

  return tokenBody.access_token;
}