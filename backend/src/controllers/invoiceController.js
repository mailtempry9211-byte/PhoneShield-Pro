/**
 * Invoice Controller
 * =============================================
 * Generates printable HTML invoices for:
 *   - Sale invoices (phone sales): GET /api/invoice/sale/:id
 *   - Repair invoices:             GET /api/invoice/repair/:id
 *
 * Auto-generates invoice numbers and returns
 * a full HTML document suitable for printing.
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const Phone = require('../models/Phone');
const Repair = require('../models/Repair');
const ApiError = require('../utils/ApiError');

/**
 * Generates an auto invoice number.
 *
 * @function generateInvoiceNumber
 * @param {string} prefix - Invoice prefix (e.g. 'SAL' or 'REP')
 * @param {string} id - Document ID (used for uniqueness)
 * @returns {string} Generated invoice number.
 */
const generateInvoiceNumber = (prefix, id) => {
  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const shortId = id.toString().slice(-6).toUpperCase();
  return `${prefix}-${dateStr}-${shortId}`;
};

/**
 * Formats a number as Indian Rupee currency.
 *
 * @function formatCurrency
 * @param {number} amount
 * @returns {string} Formatted currency string.
 */
const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a date for display.
 *
 * @function formatDate
 * @param {Date} date
 * @returns {string} Formatted date string.
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Base HTML template for invoices.
 *
 * @function invoiceTemplate
 * @param {Object} data - Invoice data
 * @returns {string} Full HTML document.
 */
const invoiceTemplate = (data) => {
  const {
    invoiceNumber,
    invoiceType,
    date,
    customerName,
    customerPhone,
    items,
    totals,
    notes,
  } = data;

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.qty * item.price)}</td>
      </tr>`
    )
    .join('');

  const totalsRows = Object.entries(totals)
    .map(
      ([label, value]) => `
      <tr>
        <td colspan="3" style="padding: 8px 10px; text-align: right; font-weight: ${label === 'Total' ? 'bold' : 'normal'};">${label}:</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: ${label === 'Total' ? 'bold' : 'normal'};">${formatCurrency(value)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a73e8, #0d47a1); color: #fff; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 28px; }
    .header .invoice-type { font-size: 14px; opacity: 0.9; margin-top: 5px; }
    .invoice-meta { text-align: right; }
    .invoice-meta p { font-size: 14px; margin: 2px 0; }
    .invoice-meta .invoice-number { font-size: 18px; font-weight: bold; }
    .section { padding: 25px 30px; }
    .section h2 { font-size: 16px; color: #333; margin-bottom: 10px; border-bottom: 2px solid #1a73e8; padding-bottom: 5px; }
    .customer-info p { font-size: 14px; margin: 3px 0; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #f0f4ff; padding: 10px; text-align: left; font-size: 13px; color: #333; border-bottom: 2px solid #1a73e8; }
    th:last-child, th:nth-child(3) { text-align: right; }
    th:nth-child(2) { text-align: center; }
    .totals-section { margin-top: 20px; }
    .totals-section table { width: 50%; margin-left: auto; }
    .notes { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; font-size: 13px; color: #666; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .print-btn { display: block; margin: 20px auto; padding: 10px 30px; background: #1a73e8; color: #fff; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
    .print-btn:hover { background: #0d47a1; }
    @media print { .print-btn { display: none; } body { padding: 0; background: #fff; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <h1>PhoneShield Pro</h1>
        <div class="invoice-type">${invoiceType}</div>
      </div>
      <div class="invoice-meta">
        <p class="invoice-number">${invoiceNumber}</p>
        <p>Date: ${date}</p>
      </div>
    </div>
    <div class="section">
      <h2>Bill To</h2>
      <div class="customer-info">
        <p><strong>${customerName}</strong></p>
        <p>Phone: ${customerPhone}</p>
      </div>
    </div>
    <div class="section">
      <h2>Items</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="totals-section">
        <table>
          <tbody>
            ${totalsRows}
          </tbody>
        </table>
      </div>
      ${notes ? `<div class="notes"><strong>Notes:</strong> ${notes}</div>` : ''}
    </div>
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>PhoneShield Pro - Your trusted phone partner</p>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">Print Invoice</button>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 500); };
  </script>
</body>
</html>`;
};

/**
 * Generate a sale invoice (HTML) for a phone.
 *
 * @route GET /api/invoice/sale/:id
 * @access Private
 */
exports.getSaleInvoice = async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);

    if (!phone) {
      return next(new ApiError(404, 'Phone not found'));
    }

    const invoiceNumber = generateInvoiceNumber('SAL', phone._id);
    const date = formatDate(phone.createdAt);

    const items = [
      {
        description: `${phone.brand} ${phone.model} (${phone.storage || 'N/A'}, ${phone.color || 'N/A'})<br>IMEI: ${phone.imei}`,
        qty: 1,
        price: phone.sellingPrice || 0,
      },
    ];

    const totals = {
      Subtotal: phone.sellingPrice || 0,
      Total: phone.sellingPrice || 0,
    };

    const html = invoiceTemplate({
      invoiceNumber,
      invoiceType: 'Sales Invoice',
      date,
      customerName: phone.customer || 'Walk-in Customer',
      customerPhone: 'N/A',
      items,
      totals,
      notes: phone.notes,
    });

    res.set('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    return next(err);
  }
};

/**
 * Generate a repair invoice (HTML) for a repair job.
 *
 * @route GET /api/invoice/repair/:id
 * @access Private
 */
exports.getRepairInvoice = async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id);

    if (!repair) {
      return next(new ApiError(404, 'Repair not found'));
    }

    const invoiceNumber = generateInvoiceNumber('REP', repair._id);
    const date = formatDate(repair.createdAt);

    const items = [
      {
        description: `Repair: ${repair.deviceBrand} ${repair.deviceModel}<br>Issue: ${repair.issue}`,
        qty: 1,
        price: repair.finalCost || repair.estimatedCost || 0,
      },
    ];

    const totals = {
      'Estimated Cost': repair.estimatedCost || 0,
      'Final Cost': repair.finalCost || 0,
      'Advance Paid': repair.advancePaid || 0,
      Balance: repair.balance || 0,
      Total: repair.finalCost || repair.estimatedCost || 0,
    };

    const html = invoiceTemplate({
      invoiceNumber,
      invoiceType: 'Repair Invoice',
      date,
      customerName: repair.customer,
      customerPhone: repair.phoneNumber,
      items,
      totals,
      notes: repair.notes,
    });

    res.set('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    return next(err);
  }
};