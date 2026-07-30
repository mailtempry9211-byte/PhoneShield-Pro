/**
 * PDF Generation Service
 * =============================================
 * Generates professional PDF documents using pdfkit.
 * Supports:
 *   - Sale Invoice PDF
 *   - Repair Invoice PDF
 *   - Purchase Receipt PDF
 *   - Warranty Card PDF
 * =============================================
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a sale invoice PDF.
 *
 * @async
 * @function generateSaleInvoicePDF
 * @param {Object} phone - Phone document
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateSaleInvoicePDF = async (phone) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {});

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('PhoneShield Pro', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Sales Invoice', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(10).font('Helvetica');
  doc.text(`Invoice Number: SAL-${phone._id.toString().slice(-6).toUpperCase()}`);
  doc.text(`Date: ${new Date(phone.createdAt).toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Customer info
  doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
  doc.fontSize(10).font('Helvetica').text(phone.customer || 'Walk-in Customer');
  doc.moveDown();

  // Items table
  doc.fontSize(12).font('Helvetica-Bold').text('Items:');
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 350;
  const col3 = 450;
  const col4 = 520;

  // Table header
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Description', col1, tableTop);
  doc.text('Qty', col2, tableTop, { width: 50, align: 'center' });
  doc.text('Unit Price', col3, tableTop, { width: 60, align: 'right' });
  doc.text('Amount', col4, tableTop, { width: 60, align: 'right' });

  // Table row
  doc.font('Helvetica').fontSize(10);
  const rowTop = tableTop + 20;
  const description = `${phone.brand} ${phone.model} (${phone.storage || 'N/A'}, ${phone.color || 'N/A'}) - IMEI: ${phone.imei}`;
  doc.text(description, col1, rowTop, { width: 290 });
  doc.text('1', col2, rowTop, { width: 50, align: 'center' });
  doc.text(`₹${(phone.sellingPrice || 0).toLocaleString('en-IN')}`, col3, rowTop, { width: 60, align: 'right' });
  doc.text(`₹${(phone.sellingPrice || 0).toLocaleString('en-IN')}`, col4, rowTop, { width: 60, align: 'right' });

  // Totals
  const totalsTop = rowTop + 30;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Total:', col3, totalsTop, { width: 60, align: 'right' });
  doc.text(`₹${(phone.sellingPrice || 0).toLocaleString('en-IN')}`, col4, totalsTop, { width: 60, align: 'right' });

  // Notes
  if (phone.notes) {
    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(10).text('Notes:');
    doc.font('Helvetica').fontSize(10).text(phone.notes);
  }

  // Footer
  doc.moveDown(3);
  doc.font('Helvetica').fontSize(9).text('Thank you for your business!', { align: 'center' });
  doc.text('PhoneShield Pro - Your trusted phone partner', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

/**
 * Generates a repair invoice PDF.
 *
 * @async
 * @function generateRepairInvoicePDF
 * @param {Object} repair - Repair document
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateRepairInvoicePDF = async (repair) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {});

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('PhoneShield Pro', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Repair Invoice', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(10).font('Helvetica');
  doc.text(`Invoice Number: REP-${repair._id.toString().slice(-6).toUpperCase()}`);
  doc.text(`Date: ${new Date(repair.createdAt).toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Customer info
  doc.fontSize(12).font('Helvetica-Bold').text('Customer Info:');
  doc.fontSize(10).font('Helvetica').text(`Name: ${repair.customer}`);
  doc.text(`Phone: ${repair.phoneNumber}`);
  doc.moveDown();

  // Device info
  doc.fontSize(12).font('Helvetica-Bold').text('Device Info:');
  doc.fontSize(10).font('Helvetica').text(`Brand: ${repair.deviceBrand}`);
  doc.text(`Model: ${repair.deviceModel}`);
  if (repair.imei) doc.text(`IMEI: ${repair.imei}`);
  doc.moveDown();

  // Issue
  doc.fontSize(12).font('Helvetica-Bold').text('Issue:');
  doc.fontSize(10).font('Helvetica').text(repair.issue);
  doc.moveDown();

  // Costs
  doc.fontSize(12).font('Helvetica-Bold').text('Cost Details:');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Estimated Cost: ₹${(repair.estimatedCost || 0).toLocaleString('en-IN')}`);
  doc.text(`Final Cost: ₹${(repair.finalCost || 0).toLocaleString('en-IN')}`);
  doc.text(`Advance Paid: ₹${(repair.advancePaid || 0).toLocaleString('en-IN')}`);
  doc.text(`Balance: ₹${(repair.balance || 0).toLocaleString('en-IN')}`);
  doc.moveDown();

  // Notes
  if (repair.notes) {
    doc.fontSize(12).font('Helvetica-Bold').text('Notes:');
    doc.fontSize(10).font('Helvetica').text(repair.notes);
    doc.moveDown();
  }

  // Footer
  doc.font('Helvetica').fontSize(9).text('Thank you for your business!', { align: 'center' });
  doc.text('PhoneShield Pro - Your trusted phone partner', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

/**
 * Generates a purchase receipt PDF.
 *
 * @async
 * @function generatePurchaseReceiptPDF
 * @param {Object} data - Receipt data
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generatePurchaseReceiptPDF = async (data) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {});

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('PhoneShield Pro', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Purchase Receipt', { align: 'center' });
  doc.moveDown();

  // Receipt details
  doc.fontSize(10).font('Helvetica');
  doc.text(`Receipt Number: PUR-${Date.now().toString().slice(-6)}`);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Seller info
  doc.fontSize(12).font('Helvetica-Bold').text('Seller Info:');
  doc.fontSize(10).font('Helvetica').text(`Name: ${data.sellerName || 'N/A'}`);
  doc.text(`Phone: ${data.sellerPhone || 'N/A'}`);
  doc.moveDown();

  // Phone details
  doc.fontSize(12).font('Helvetica-Bold').text('Phone Details:');
  doc.fontSize(10).font('Helvetica').text(`Brand: ${data.brand}`);
  doc.text(`Model: ${data.model}`);
  doc.text(`IMEI: ${data.imei}`);
  doc.text(`Condition: ${data.condition || 'N/A'}`);
  doc.moveDown();

  // Price
  doc.fontSize(12).font('Helvetica-Bold').text('Price Details:');
  doc.fontSize(10).font('Helvetica').text(`Purchase Price: ₹${(data.purchasePrice || 0).toLocaleString('en-IN')}`);
  doc.moveDown();

  // Notes
  if (data.notes) {
    doc.fontSize(12).font('Helvetica-Bold').text('Notes:');
    doc.fontSize(10).font('Helvetica').text(data.notes);
    doc.moveDown();
  }

  // Footer
  doc.font('Helvetica').fontSize(9).text('Thank you for your business!', { align: 'center' });
  doc.text('PhoneShield Pro - Your trusted phone partner', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

/**
 * Generates a warranty card PDF.
 *
 * @async
 * @function generateWarrantyCardPDF
 * @param {Object} data - Warranty data
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateWarrantyCardPDF = async (data) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {});

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('PhoneShield Pro', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Warranty Card', { align: 'center' });
  doc.moveDown();

  // Warranty details
  doc.fontSize(10).font('Helvetica');
  doc.text(`Warranty Number: WAR-${Date.now().toString().slice(-6)}`);
  doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Customer info
  doc.fontSize(12).font('Helvetica-Bold').text('Customer Info:');
  doc.fontSize(10).font('Helvetica').text(`Name: ${data.customerName || 'N/A'}`);
  doc.text(`Phone: ${data.customerPhone || 'N/A'}`);
  doc.moveDown();

  // Device info
  doc.fontSize(12).font('Helvetica-Bold').text('Device Info:');
  doc.fontSize(10).font('Helvetica').text(`Brand: ${data.brand}`);
  doc.text(`Model: ${data.model}`);
  doc.text(`IMEI: ${data.imei}`);
  doc.moveDown();

  // Warranty period
  doc.fontSize(12).font('Helvetica-Bold').text('Warranty Period:');
  doc.fontSize(10).font('Helvetica').text(`From: ${new Date().toLocaleDateString('en-IN')}`);
  const validTill = new Date();
  validTill.setMonth(validTill.getMonth() + (data.warrantyMonths || 6));
  doc.text(`To: ${validTill.toLocaleDateString('en-IN')}`);
  doc.text(`Duration: ${data.warrantyMonths || 6} months`);
  doc.moveDown();

  // Terms
  doc.fontSize(12).font('Helvetica-Bold').text('Terms & Conditions:');
  doc.fontSize(9).font('Helvetica').text('1. This warranty covers manufacturing defects only.');
  doc.text('2. Physical damage is not covered under this warranty.');
  doc.text('3. Warranty is void if the device is opened by unauthorized personnel.');
  doc.moveDown();

  // Footer
  doc.font('Helvetica').fontSize(9).text('Thank you for your purchase!', { align: 'center' });
  doc.text('PhoneShield Pro - Your trusted phone partner', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};