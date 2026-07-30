/**
 * Auth Module Test Script
 * =============================================
 * Tests all authentication endpoints:
 *   1. POST /api/auth/register (valid)
 *   2. POST /api/auth/register (validation errors)
 *   3. POST /api/auth/login (valid)
 *   4. POST /api/auth/login (invalid credentials)
 *   5. GET  /api/auth/profile (with token)
 *   6. GET  /api/auth/profile (without token)
 *   7. Login with default admin
 * =============================================
 */

const http = require('http');

const BASE = { host: '127.0.0.1', port: 5000 };

/**
 * Helper: make an HTTP request and return {statusCode, body}.
 */
function request(method, path, payload, token) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { ...BASE, path, method, headers },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const log = (label, result) => {
  console.log(`\n=== ${label} ===`);
  console.log(`Status: ${result.statusCode}`);
  console.log(`Body:   ${JSON.stringify(result.body)}`);
};

(async () => {
  let allPassed = true;
  const results = {};

  // 1. Register - valid (use unique email with timestamp)
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const regBody = {
    name: 'Test User',
    email: uniqueEmail,
    password: 'password123',
    phone: '9876543210',
  };
  const reg = await request('POST', '/api/auth/register', regBody);
  log('1. Register (valid)', reg);
  results.register = reg;
  if (reg.statusCode !== 201 || !reg.body.success || reg.body.user.password) {
    allPassed = false;
  }

  // 1b. Register - duplicate email (should return 409)
  const regDup = await request('POST', '/api/auth/register', regBody);
  log('1b. Register (duplicate email)', regDup);
  results.registerDup = regDup;
  if (regDup.statusCode !== 409 || regDup.body.success !== false) {
    allPassed = false;
  }

  // 2. Register - missing fields
  const regBad = await request('POST', '/api/auth/register', { email: 'bad@example.com' });
  log('2. Register (missing fields)', regBad);
  results.registerMissing = regBad;
  if (regBad.statusCode !== 400 || regBad.body.success !== false) {
    allPassed = false;
  }

  // 3. Register - invalid email
  const regBadEmail = await request('POST', '/api/auth/register', {
    name: 'Bad Email',
    email: 'notanemail',
    password: 'password123',
    phone: '1234567890',
  });
  log('3. Register (invalid email)', regBadEmail);
  results.registerBadEmail = regBadEmail;
  if (regBadEmail.statusCode !== 400 || regBadEmail.body.success !== false) {
    allPassed = false;
  }

  // 4. Register - short password
  const regShortPass = await request('POST', '/api/auth/register', {
    name: 'Short Pass',
    email: 'short@example.com',
    password: '1234567',
    phone: '1234567890',
  });
  log('4. Register (short password)', regShortPass);
  results.registerShortPass = regShortPass;
  if (regShortPass.statusCode !== 400 || regShortPass.body.success !== false) {
    allPassed = false;
  }

  // 5. Login - valid
  const login = await request('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'password123',
  });
  log('5. Login (valid)', login);
  results.login = login;
  if (login.statusCode !== 200 || !login.body.success || login.body.user.password) {
    allPassed = false;
  }

  // 6. Login - invalid credentials
  const loginBad = await request('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'wrongpassword',
  });
  log('6. Login (invalid credentials)', loginBad);
  results.loginBad = loginBad;
  if (loginBad.statusCode !== 401 || loginBad.body.success !== false) {
    allPassed = false;
  }

  // 7. Profile - with token
  const token = login.body.token;
  const profile = await request('GET', '/api/auth/profile', null, token);
  log('7. Profile (with token)', profile);
  results.profile = profile;
  if (profile.statusCode !== 200 || !profile.body.success || profile.body.user.password) {
    allPassed = false;
  }

  // 8. Profile - without token
  const profileNoToken = await request('GET', '/api/auth/profile', null, null);
  log('8. Profile (without token)', profileNoToken);
  results.profileNoToken = profileNoToken;
  if (profileNoToken.statusCode !== 401 || profileNoToken.body.success !== false) {
    allPassed = false;
  }

  // 9. Login - default admin
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@phoneshield.com',
    password: '12345678',
  });
  log('9. Login (default admin)', adminLogin);
  results.adminLogin = adminLogin;
  if (adminLogin.statusCode !== 200 || !adminLogin.body.success) {
    allPassed = false;
  }

  // 10. Profile - admin with token
  const adminToken = adminLogin.body.token;
  const adminProfile = await request('GET', '/api/auth/profile', null, adminToken);
  log('10. Profile (admin with token)', adminProfile);
  results.adminProfile = adminProfile;
  if (adminProfile.statusCode !== 200 || !adminProfile.body.success) {
    allPassed = false;
  }

  console.log(`\n\n=== SUMMARY ===`);
  console.log(`All tests passed: ${allPassed}`);
  console.log(`Result: ${allPassed ? 'PASS' : 'FAIL'}`);

  process.exit(allPassed ? 0 : 1);
})().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});