/**
 * Repair, Invoice, and Dashboard Module Test Script
 * =============================================
 * Tests all repair CRUD, invoice generation,
 * and dashboard statistics endpoints.
 * =============================================
 */

const http = require('http');

const BASE = { host: '127.0.0.1', port: 5000 };

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
  console.log(`Body:   ${JSON.stringify(result.body).substring(0, 250)}`);
};

(async () => {
  let allPassed = true;

  // --- Login as admin ---
  const login = await request('POST', '/api/auth/login', {
    email: 'admin@phoneshield.com',
    password: '12345678',
  });
  if (login.statusCode !== 200 || !login.body.token) {
    console.log('ERROR: Could not login as admin. Aborting tests.');
    process.exit(1);
  }
  const token = login.body.token;
  console.log('Admin login successful. Token acquired.\n');

  // =============================================
  // REPAIR TESTS
  // =============================================
  console.log('========== REPAIR TESTS ==========');

  // 1. Create repair - valid
  const repairData = {
    customer: 'John Doe',
    phoneNumber: '9876543210',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S21',
    imei: '35' + Date.now(),
    issue: 'Screen cracked',
    accessories: 'Charger, Case',
    estimatedCost: 5000,
    finalCost: 4500,
    advancePaid: 2000,
    balance: 2500,
    technician: 'Mike Tech',
    priority: 'high',
    status: 'Received',
    notes: 'Urgent repair',
  };
  const createRepair = await request('POST', '/api/repairs', repairData, token);
  log('R1. Create repair (valid)', createRepair);
  if (createRepair.statusCode !== 201 || !createRepair.body.success) allPassed = false;

  const repairId = createRepair.body.repair ? createRepair.body.repair._id : null;

  // 2. Create repair - missing fields
  const createRepairBad = await request('POST', '/api/repairs', { customer: 'No Phone' }, token);
  log('R2. Create repair (missing fields)', createRepairBad);
  if (createRepairBad.statusCode !== 400 || createRepairBad.body.success !== false) allPassed = false;

  // 3. Get all repairs
  const getRepairs = await request('GET', '/api/repairs', null, token);
  log('R3. Get all repairs', getRepairs);
  if (getRepairs.statusCode !== 200 || !getRepairs.body.success) allPassed = false;

  // 4. Get repairs with pagination
  const getRepairsPaged = await request('GET', '/api/repairs?page=1&limit=5', null, token);
  log('R4. Get repairs (pagination)', getRepairsPaged);
  if (getRepairsPaged.statusCode !== 200 || !getRepairsPaged.body.success || getRepairsPaged.body.page !== 1) allPassed = false;

  // 5. Search repairs by phone
  const searchRepairsPhone = await request('GET', `/api/repairs?search=${repairData.phoneNumber}`, null, token);
  log('R5. Search repairs (by phone)', searchRepairsPhone);
  if (searchRepairsPhone.statusCode !== 200 || !searchRepairsPhone.body.success) allPassed = false;

  // 6. Search repairs by customer
  const searchRepairsCustomer = await request('GET', '/api/repairs?search=John', null, token);
  log('R6. Search repairs (by customer)', searchRepairsCustomer);
  if (searchRepairsCustomer.statusCode !== 200 || !searchRepairsCustomer.body.success) allPassed = false;

  // 7. Get single repair - valid
  const getRepair = await request('GET', `/api/repairs/${repairId}`, null, token);
  log('R7. Get single repair (valid)', getRepair);
  if (getRepair.statusCode !== 200 || !getRepair.body.success) allPassed = false;

  // 8. Get single repair - not found
  const getRepairNotFound = await request('GET', '/api/repairs/6a6af08d4c2feb88513521f0', null, token);
  log('R8. Get single repair (not found)', getRepairNotFound);
  if (getRepairNotFound.statusCode !== 404 || getRepairNotFound.body.success !== false) allPassed = false;

  // 9. Update repair - valid
  const updateRepair = await request('PUT', `/api/repairs/${repairId}`, {
    status: 'Repairing',
    notes: 'Screen replaced',
  }, token);
  log('R9. Update repair (valid)', updateRepair);
  if (updateRepair.statusCode !== 200 || !updateRepair.body.success) allPassed = false;

  // 10. Update repair - not found
  const updateRepairNotFound = await request('PUT', '/api/repairs/6a6af08d4c2feb88513521f0', {
    status: 'Ready',
  }, token);
  log('R10. Update repair (not found)', updateRepairNotFound);
  if (updateRepairNotFound.statusCode !== 404 || updateRepairNotFound.body.success !== false) allPassed = false;

  // 11. Delete repair - valid
  const deleteRepair = await request('DELETE', `/api/repairs/${repairId}`, null, token);
  log('R11. Delete repair (valid)', deleteRepair);
  if (deleteRepair.statusCode !== 200 || !deleteRepair.body.success) allPassed = false;

  // 12. Delete repair - not found
  const deleteRepairNotFound = await request('DELETE', `/api/repairs/${repairId}`, null, token);
  log('R12. Delete repair (not found)', deleteRepairNotFound);
  if (deleteRepairNotFound.statusCode !== 404 || deleteRepairNotFound.body.success !== false) allPassed = false;

  // 13. Get repairs without token
  const repairsNoToken = await request('GET', '/api/repairs', null, null);
  log('R13. Get repairs (without token)', repairsNoToken);
  if (repairsNoToken.statusCode !== 401 || repairsNoToken.body.success !== false) allPassed = false;

  // =============================================
  // INVOICE TESTS
  // =============================================
  console.log('\n\n========== INVOICE TESTS ==========');

  // Create a phone for sale invoice test
  const phoneData = {
    brand: 'Apple',
    model: 'iPhone 14',
    imei: '35' + Date.now(),
    storage: '128GB',
    ram: '6GB',
    color: 'Blue',
    batteryHealth: '95%',
    condition: 'Excellent',
    purchasePrice: 60000,
    sellingPrice: 70000,
    seller: 'Test Seller',
    customer: 'Test Customer',
    status: 'sold',
    invoiceNumber: 'INV-001',
    notes: 'Test phone for invoice',
  };
  const createPhone = await request('POST', '/api/phones', phoneData, token);
  log('I0. Create phone for invoice test', createPhone);
  if (createPhone.statusCode !== 201 || !createPhone.body.success) allPassed = false;

  const phoneId = createPhone.body.phone ? createPhone.body.phone._id : null;

  // 1. Get sale invoice
  const saleInvoice = await request('GET', `/api/invoice/sale/${phoneId}`, null, token);
  log('I1. Get sale invoice', saleInvoice);
  if (saleInvoice.statusCode !== 200 || !saleInvoice.body.includes('Sales Invoice')) allPassed = false;

  // 2. Get repair invoice - not found
  const repairInvoiceNotFound = await request('GET', '/api/invoice/repair/6a6af08d4c2feb88513521f0', null, token);
  log('I2. Get repair invoice (not found)', repairInvoiceNotFound);
  if (repairInvoiceNotFound.statusCode !== 404 || repairInvoiceNotFound.body.success !== false) allPassed = false;

  // 3. Get sale invoice - not found
  const saleInvoiceNotFound = await request('GET', '/api/invoice/sale/6a6af08d4c2feb88513521f0', null, token);
  log('I3. Get sale invoice (not found)', saleInvoiceNotFound);
  if (saleInvoiceNotFound.statusCode !== 404 || saleInvoiceNotFound.body.success !== false) allPassed = false;

  // =============================================
  // DASHBOARD TESTS
  // =============================================
  console.log('\n\n========== DASHBOARD TESTS ==========');

  // 1. Get dashboard stats
  const dashboard = await request('GET', '/api/dashboard', null, token);
  log('D1. Get dashboard', dashboard);
  if (dashboard.statusCode !== 200 || !dashboard.body.success || !dashboard.body.dashboard) allPassed = false;

  // 2. Get dashboard without token
  const dashboardNoToken = await request('GET', '/api/dashboard', null, null);
  log('D2. Get dashboard (without token)', dashboardNoToken);
  if (dashboardNoToken.statusCode !== 401 || dashboardNoToken.body.success !== false) allPassed = false;

  // =============================================
  // SUMMARY
  // =============================================
  console.log(`\n\n=== SUMMARY ===`);
  console.log(`All tests passed: ${allPassed}`);
  console.log(`Result: ${allPassed ? 'PASS' : 'FAIL'}`);

  process.exit(allPassed ? 0 : 1);
})().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});