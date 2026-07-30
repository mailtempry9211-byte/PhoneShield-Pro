/**
 * Test Script for New Modules
 * =============================================
 * Tests:
 *   - Upload routes
 *   - PDF routes
 *   - WhatsApp routes
 *   - Report routes
 *   - Search route
 *   - Backup routes
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
  // REPORT TESTS
  // =============================================
  console.log('========== REPORT TESTS ==========');

  const dailyReport = await request('GET', '/api/reports/daily', null, token);
  log('R1. Daily report', dailyReport);
  if (dailyReport.statusCode !== 200 || !dailyReport.body.success) allPassed = false;

  const weeklyReport = await request('GET', '/api/reports/weekly', null, token);
  log('R2. Weekly report', weeklyReport);
  if (weeklyReport.statusCode !== 200 || !weeklyReport.body.success) allPassed = false;

  const monthlyReport = await request('GET', '/api/reports/monthly', null, token);
  log('R3. Monthly report', monthlyReport);
  if (monthlyReport.statusCode !== 200 || !monthlyReport.body.success) allPassed = false;

  const profitReport = await request('GET', '/api/reports/profit', null, token);
  log('R4. Profit report', profitReport);
  if (profitReport.statusCode !== 200 || !profitReport.body.success) allPassed = false;

  const repairReport = await request('GET', '/api/reports/repairs', null, token);
  log('R5. Repair report', repairReport);
  if (repairReport.statusCode !== 200 || !repairReport.body.success) allPassed = false;

  const inventoryReport = await request('GET', '/api/reports/inventory', null, token);
  log('R6. Inventory report', inventoryReport);
  if (inventoryReport.statusCode !== 200 || !inventoryReport.body.success) allPassed = false;

  const topBrands = await request('GET', '/api/reports/top-brands', null, token);
  log('R7. Top brands', topBrands);
  if (topBrands.statusCode !== 200 || !topBrands.body.success) allPassed = false;

  const topSellers = await request('GET', '/api/reports/top-sellers', null, token);
  log('R8. Top sellers', topSellers);
  if (topSellers.statusCode !== 200 || !topSellers.body.success) allPassed = false;

  // =============================================
  // SEARCH TESTS
  // =============================================
  console.log('\n\n========== SEARCH TESTS ==========');

  const search = await request('GET', '/api/search?q=test', null, token);
  log('S1. Global search', search);
  if (search.statusCode !== 200 || !search.body.success) allPassed = false;

  const searchShort = await request('GET', '/api/search?q=a', null, token);
  log('S2. Global search (short query)', searchShort);
  if (searchShort.statusCode !== 200 || !searchShort.body.success) allPassed = false;

  // =============================================
  // BACKUP TESTS
  // =============================================
  console.log('\n\n========== BACKUP TESTS ==========');

  const backupStats = await request('GET', '/api/backup/stats', null, token);
  log('B1. Backup stats', backupStats);
  if (backupStats.statusCode !== 200 || !backupStats.body.success) allPassed = false;

  const backupExport = await request('GET', '/api/backup/export', null, token);
  log('B2. Backup export', backupExport);
  if (backupExport.statusCode !== 200 || !backupExport.body.success) allPassed = false;

  // =============================================
  // WHATSAPP TESTS
  // =============================================
  console.log('\n\n========== WHATSAPP TESTS ==========');

  // Create a phone for WhatsApp tests
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
    customerPhone: '9876543210',
    status: 'sold',
    notes: 'Test phone for WhatsApp',
  };
  const createPhone = await request('POST', '/api/phones', phoneData, token);
  log('W0. Create phone for WhatsApp test', createPhone);
  if (createPhone.statusCode !== 201 || !createPhone.body.success) allPassed = false;

  const phoneId = createPhone.body.phone ? createPhone.body.phone._id : null;

  const whatsappInvoice = await request('GET', `/api/whatsapp/invoice/${phoneId}`, null, token);
  log('W1. WhatsApp invoice link', whatsappInvoice);
  if (whatsappInvoice.statusCode !== 200 || !whatsappInvoice.body.success || !whatsappInvoice.body.link) allPassed = false;

  const whatsappPhone = await request('GET', `/api/whatsapp/phone/${phoneId}`, null, token);
  log('W2. WhatsApp phone link', whatsappPhone);
  if (whatsappPhone.statusCode !== 200 || !whatsappPhone.body.success || !whatsappPhone.body.link) allPassed = false;

  const whatsappReceipt = await request('GET', `/api/whatsapp/receipt/${phoneId}`, null, token);
  log('W3. WhatsApp receipt link', whatsappReceipt);
  if (whatsappReceipt.statusCode !== 200 || !whatsappReceipt.body.success || !whatsappReceipt.body.link) allPassed = false;

  // =============================================
  // PDF TESTS
  // =============================================
  console.log('\n\n========== PDF TESTS ==========');

  const pdfSale = await request('GET', `/api/pdf/sale/${phoneId}`, null, token);
  log('P1. Sale PDF', pdfSale);
  if (pdfSale.statusCode !== 200 || !pdfSale.body.includes('%PDF')) allPassed = false;

  const pdfReceipt = await request('GET', `/api/pdf/receipt/${phoneId}`, null, token);
  log('P2. Receipt PDF', pdfReceipt);
  if (pdfReceipt.statusCode !== 200 || !pdfReceipt.body.includes('%PDF')) allPassed = false;

  const pdfWarranty = await request('GET', `/api/pdf/warranty/${phoneId}`, null, token);
  log('P3. Warranty PDF', pdfWarranty);
  if (pdfWarranty.statusCode !== 200 || !pdfWarranty.body.includes('%PDF')) allPassed = false;

  // =============================================
  // UPLOAD TESTS (skip actual file upload, just test route exists)
  // =============================================
  console.log('\n\n========== UPLOAD TESTS ==========');

  const uploadNoFile = await request('POST', '/api/upload/phone', null, token);
  log('U1. Upload phone (no file)', uploadNoFile);
  if (uploadNoFile.statusCode !== 400 || uploadNoFile.body.success !== false) allPassed = false;

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