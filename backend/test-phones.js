/**
 * Phone Inventory Module Test Script
 * =============================================
 * Tests all phone CRUD endpoints:
 *   1. POST /api/phones (create - valid)
 *   2. POST /api/phones (create - missing fields)
 *   3. POST /api/phones (create - duplicate IMEI)
 *   4. GET  /api/phones (list all)
 *   5. GET  /api/phones/:id (get single - valid)
 *   6. GET  /api/phones/:id (get single - not found)
 *   7. PUT  /api/phones/:id (update - valid)
 *   8. PUT  /api/phones/:id (update - not found)
 *   9. DELETE /api/phones/:id (delete - valid)
 *   10. DELETE /api/phones/:id (delete - not found)
 *   11. GET /api/phones (without token - unauthorized)
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
  console.log(`Body:   ${JSON.stringify(result.body).substring(0, 300)}`);
};

(async () => {
  let allPassed = true;

  // --- Step 1: Login as admin to get JWT token ---
  const login = await request('POST', '/api/auth/login', {
    email: 'admin@phoneshield.com',
    password: '12345678',
  });
  console.log(`\n=== Login (admin) ===`);
  console.log(`Status: ${login.statusCode}`);
  if (login.statusCode !== 200 || !login.body.token) {
    console.log('ERROR: Could not login as admin. Aborting tests.');
    process.exit(1);
  }
  const token = login.body.token;
  console.log('Token acquired.');

  // --- Step 2: Test Phone CRUD ---

  // 1. Create phone - valid
  const uniqueImei = `35${Date.now()}`;
  const phoneData = {
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    imei: uniqueImei,
    storage: '256GB',
    ram: '6GB',
    color: 'Graphite',
    batteryHealth: '92%',
    condition: 'Excellent',
    purchasePrice: 50000,
    sellingPrice: 55000,
    seller: 'John Seller',
    customer: '',
    status: 'in-stock',
    images: ['image1.jpg', 'image2.jpg'],
    invoiceNumber: 'INV-001',
    notes: 'Test phone entry',
  };
  const create = await request('POST', '/api/phones', phoneData, token);
  log('1. Create phone (valid)', create);
  if (create.statusCode !== 201 || !create.body.success || !create.body.phone) {
    allPassed = false;
  }

  const phoneId = create.body.phone ? create.body.phone._id : null;

  // 2. Create phone - missing fields
  const createBad = await request('POST', '/api/phones', { brand: 'Samsung' }, token);
  log('2. Create phone (missing fields)', createBad);
  if (createBad.statusCode !== 400 || createBad.body.success !== false) {
    allPassed = false;
  }

  // 3. Create phone - duplicate IMEI
  const createDup = await request('POST', '/api/phones', phoneData, token);
  log('3. Create phone (duplicate IMEI)', createDup);
  if (createDup.statusCode !== 409 || createDup.body.success !== false) {
    allPassed = false;
  }

  // 4. Get all phones
  const list = await request('GET', '/api/phones', null, token);
  log('4. Get all phones', list);
  if (list.statusCode !== 200 || !list.body.success) {
    allPassed = false;
  }

  // 5. Get single phone - valid
  const getOne = await request('GET', `/api/phones/${phoneId}`, null, token);
  log('5. Get single phone (valid)', getOne);
  if (getOne.statusCode !== 200 || !getOne.body.success) {
    allPassed = false;
  }

  // 6. Get single phone - not found
  const getNotFound = await request('GET', '/api/phones/6a6af08d4c2feb88513521f0', null, token);
  log('6. Get single phone (not found)', getNotFound);
  if (getNotFound.statusCode !== 404 || getNotFound.body.success !== false) {
    allPassed = false;
  }

  // 7. Update phone - valid
  const update = await request('PUT', `/api/phones/${phoneId}`, {
    sellingPrice: 58000,
    status: 'sold',
    customer: 'Jane Buyer',
    notes: 'Updated by test',
  }, token);
  log('7. Update phone (valid)', update);
  if (update.statusCode !== 200 || !update.body.success) {
    allPassed = false;
  }

  // 8. Update phone - not found
  const updateNotFound = await request('PUT', '/api/phones/6a6af08d4c2feb88513521f0', {
    sellingPrice: 99999,
  }, token);
  log('8. Update phone (not found)', updateNotFound);
  if (updateNotFound.statusCode !== 404 || updateNotFound.body.success !== false) {
    allPassed = false;
  }

  // 9. Delete phone - valid
  const del = await request('DELETE', `/api/phones/${phoneId}`, null, token);
  log('9. Delete phone (valid)', del);
  if (del.statusCode !== 200 || !del.body.success) {
    allPassed = false;
  }

  // 10. Delete phone - not found (already deleted)
  const delNotFound = await request('DELETE', `/api/phones/${phoneId}`, null, token);
  log('10. Delete phone (not found)', delNotFound);
  if (delNotFound.statusCode !== 404 || delNotFound.body.success !== false) {
    allPassed = false;
  }

  // 11. Get phones without token - unauthorized
  const noToken = await request('GET', '/api/phones', null, null);
  log('11. Get phones (without token)', noToken);
  if (noToken.statusCode !== 401 || noToken.body.success !== false) {
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