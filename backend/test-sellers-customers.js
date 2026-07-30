/**
 * Seller & Customer Module Test Script
 * =============================================
 * Tests all CRUD, search, and pagination endpoints
 * for both sellers and customers.
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
  // SELLER TESTS
  // =============================================
  console.log('========== SELLER TESTS ==========');

  // 1. Create seller - valid
  const sellerData = {
    name: 'John Seller',
    phone: '9876543210',
    alternatePhone: '9876500000',
    email: 'john.seller@example.com',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    documentImages: ['doc1.jpg', 'doc2.jpg'],
    notes: 'Test seller',
    totalDeals: 5,
    totalPurchaseAmount: 250000,
  };
  const createSeller = await request('POST', '/api/sellers', sellerData, token);
  log('S1. Create seller (valid)', createSeller);
  if (createSeller.statusCode !== 201 || !createSeller.body.success) allPassed = false;

  const sellerId = createSeller.body.seller ? createSeller.body.seller._id : null;

  // 2. Create seller - missing fields
  const createSellerBad = await request('POST', '/api/sellers', { name: 'No Phone' }, token);
  log('S2. Create seller (missing fields)', createSellerBad);
  if (createSellerBad.statusCode !== 400 || createSellerBad.body.success !== false) allPassed = false;

  // 3. Get all sellers
  const getSellers = await request('GET', '/api/sellers', null, token);
  log('S3. Get all sellers', getSellers);
  if (getSellers.statusCode !== 200 || !getSellers.body.success) allPassed = false;

  // 4. Get sellers with pagination
  const getSellersPaged = await request('GET', '/api/sellers?page=1&limit=5', null, token);
  log('S4. Get sellers (pagination)', getSellersPaged);
  if (getSellersPaged.statusCode !== 200 || !getSellersPaged.body.success || getSellersPaged.body.page !== 1) allPassed = false;

  // 5. Search sellers by name
  const searchSellers = await request('GET', '/api/sellers?search=John', null, token);
  log('S5. Search sellers (by name)', searchSellers);
  if (searchSellers.statusCode !== 200 || !searchSellers.body.success) allPassed = false;

  // 6. Search sellers by phone
  const searchSellersPhone = await request('GET', '/api/sellers?search=9876543210', null, token);
  log('S6. Search sellers (by phone)', searchSellersPhone);
  if (searchSellersPhone.statusCode !== 200 || !searchSellersPhone.body.success) allPassed = false;

  // 7. Get single seller - valid
  const getSeller = await request('GET', `/api/sellers/${sellerId}`, null, token);
  log('S7. Get single seller (valid)', getSeller);
  if (getSeller.statusCode !== 200 || !getSeller.body.success) allPassed = false;

  // 8. Get single seller - not found
  const getSellerNotFound = await request('GET', '/api/sellers/6a6af08d4c2feb88513521f0', null, token);
  log('S8. Get single seller (not found)', getSellerNotFound);
  if (getSellerNotFound.statusCode !== 404 || getSellerNotFound.body.success !== false) allPassed = false;

  // 9. Update seller - valid
  const updateSeller = await request('PUT', `/api/sellers/${sellerId}`, {
    city: 'Delhi',
    notes: 'Updated seller notes',
    totalDeals: 10,
  }, token);
  log('S9. Update seller (valid)', updateSeller);
  if (updateSeller.statusCode !== 200 || !updateSeller.body.success) allPassed = false;

  // 10. Update seller - not found
  const updateSellerNotFound = await request('PUT', '/api/sellers/6a6af08d4c2feb88513521f0', {
    city: 'Pune',
  }, token);
  log('S10. Update seller (not found)', updateSellerNotFound);
  if (updateSellerNotFound.statusCode !== 404 || updateSellerNotFound.body.success !== false) allPassed = false;

  // 11. Delete seller - valid
  const deleteSeller = await request('DELETE', `/api/sellers/${sellerId}`, null, token);
  log('S11. Delete seller (valid)', deleteSeller);
  if (deleteSeller.statusCode !== 200 || !deleteSeller.body.success) allPassed = false;

  // 12. Delete seller - not found
  const deleteSellerNotFound = await request('DELETE', `/api/sellers/${sellerId}`, null, token);
  log('S12. Delete seller (not found)', deleteSellerNotFound);
  if (deleteSellerNotFound.statusCode !== 404 || deleteSellerNotFound.body.success !== false) allPassed = false;

  // 13. Get sellers without token
  const sellersNoToken = await request('GET', '/api/sellers', null, null);
  log('S13. Get sellers (without token)', sellersNoToken);
  if (sellersNoToken.statusCode !== 401 || sellersNoToken.body.success !== false) allPassed = false;

  // =============================================
  // CUSTOMER TESTS
  // =============================================
  console.log('\n\n========== CUSTOMER TESTS ==========');

  // 1. Create customer - valid
  const customerData = {
    name: 'Jane Buyer',
    phone: '9123456789',
    alternatePhone: '9123400000',
    email: 'jane.buyer@example.com',
    address: '456 Park Avenue',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    aadhaarNumber: '987654321098',
    documentImages: ['cust_doc1.jpg'],
    notes: 'Test customer',
    totalPurchases: 3,
  };
  const createCustomer = await request('POST', '/api/customers', customerData, token);
  log('C1. Create customer (valid)', createCustomer);
  if (createCustomer.statusCode !== 201 || !createCustomer.body.success) allPassed = false;

  const customerId = createCustomer.body.customer ? createCustomer.body.customer._id : null;

  // 2. Create customer - missing fields
  const createCustomerBad = await request('POST', '/api/customers', { name: 'No Phone' }, token);
  log('C2. Create customer (missing fields)', createCustomerBad);
  if (createCustomerBad.statusCode !== 400 || createCustomerBad.body.success !== false) allPassed = false;

  // 3. Get all customers
  const getCustomers = await request('GET', '/api/customers', null, token);
  log('C3. Get all customers', getCustomers);
  if (getCustomers.statusCode !== 200 || !getCustomers.body.success) allPassed = false;

  // 4. Get customers with pagination
  const getCustomersPaged = await request('GET', '/api/customers?page=1&limit=5', null, token);
  log('C4. Get customers (pagination)', getCustomersPaged);
  if (getCustomersPaged.statusCode !== 200 || !getCustomersPaged.body.success || getCustomersPaged.body.page !== 1) allPassed = false;

  // 5. Search customers by name
  const searchCustomers = await request('GET', '/api/customers?search=Jane', null, token);
  log('C5. Search customers (by name)', searchCustomers);
  if (searchCustomers.statusCode !== 200 || !searchCustomers.body.success) allPassed = false;

  // 6. Search customers by phone
  const searchCustomersPhone = await request('GET', '/api/customers?search=9123456789', null, token);
  log('C6. Search customers (by phone)', searchCustomersPhone);
  if (searchCustomersPhone.statusCode !== 200 || !searchCustomersPhone.body.success) allPassed = false;

  // 7. Get single customer - valid
  const getCustomer = await request('GET', `/api/customers/${customerId}`, null, token);
  log('C7. Get single customer (valid)', getCustomer);
  if (getCustomer.statusCode !== 200 || !getCustomer.body.success) allPassed = false;

  // 8. Get single customer - not found
  const getCustomerNotFound = await request('GET', '/api/customers/6a6af08d4c2feb88513521f0', null, token);
  log('C8. Get single customer (not found)', getCustomerNotFound);
  if (getCustomerNotFound.statusCode !== 404 || getCustomerNotFound.body.success !== false) allPassed = false;

  // 9. Update customer - valid
  const updateCustomer = await request('PUT', `/api/customers/${customerId}`, {
    city: 'Chennai',
    notes: 'Updated customer notes',
    totalPurchases: 7,
  }, token);
  log('C9. Update customer (valid)', updateCustomer);
  if (updateCustomer.statusCode !== 200 || !updateCustomer.body.success) allPassed = false;

  // 10. Update customer - not found
  const updateCustomerNotFound = await request('PUT', '/api/customers/6a6af08d4c2feb88513521f0', {
    city: 'Kolkata',
  }, token);
  log('C10. Update customer (not found)', updateCustomerNotFound);
  if (updateCustomerNotFound.statusCode !== 404 || updateCustomerNotFound.body.success !== false) allPassed = false;

  // 11. Delete customer - valid
  const deleteCustomer = await request('DELETE', `/api/customers/${customerId}`, null, token);
  log('C11. Delete customer (valid)', deleteCustomer);
  if (deleteCustomer.statusCode !== 200 || !deleteCustomer.body.success) allPassed = false;

  // 12. Delete customer - not found
  const deleteCustomerNotFound = await request('DELETE', `/api/customers/${customerId}`, null, token);
  log('C12. Delete customer (not found)', deleteCustomerNotFound);
  if (deleteCustomerNotFound.statusCode !== 404 || deleteCustomerNotFound.body.success !== false) allPassed = false;

  // 13. Get customers without token
  const customersNoToken = await request('GET', '/api/customers', null, null);
  log('C13. Get customers (without token)', customersNoToken);
  if (customersNoToken.statusCode !== 401 || customersNoToken.body.success !== false) allPassed = false;

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