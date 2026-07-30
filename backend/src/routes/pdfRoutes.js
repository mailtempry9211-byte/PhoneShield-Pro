/**
 * PDF Routes
 * =============================================
 * Defines PDF generation endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/pdf/sale/:id        - Generate sale invoice PDF
 *   GET /api/pdf/repair/:id      - Generate repair invoice PDF
 *   GET /api/pdf/receipt/:id     - Generate purchase receipt PDF
 *   GET /api/pdf/warranty/:id    - Generate warranty card PDF
 * =============================================
 */

const express = require('express');
const {
  generateSaleInvoicePDF,
  generateRepairInvoicePDF,
  generatePurchaseReceiptPDF,
  generateWarrantyCardPDF,
} = require('../services/pdfService');
const Phone = require('../models/Phone');
const Repair = require('../models/Repair');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all PDF routes with JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/pdf/sale/:id
 * @desc    Generate sale invoice PDF
 * @access  Private
 */
router.get('/sale/:id', async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found',
      });
    }

    const pdfBuffer = await generateSaleInvoicePDF(phone);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sale-invoice-${phone._id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/pdf/repair/:id
 * @desc    Generate repair invoice PDF
 * @access  Private
 */
router.get('/repair/:id', async (req, res, next) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found',
      });
    }

    const pdfBuffer = await generateRepairInvoicePDF(repair);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=repair-invoice-${repair._id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/pdf/receipt/:id
 * @desc    Generate purchase receipt PDF
 * @access  Private
 */
router.get('/receipt/:id', async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found',
      });
    }

    const pdfBuffer = await generatePurchaseReceiptPDF({
      sellerName: phone.seller,
      sellerPhone: 'N/A',
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
      condition: phone.condition,
      purchasePrice: phone.purchasePrice,
      notes: phone.notes,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-receipt-${phone._id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/pdf/warranty/:id
 * @desc    Generate warranty card PDF
 * @access  Private
 */
router.get('/warranty/:id', async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found',
      });
    }

    const pdfBuffer = await generateWarrantyCardPDF({
      customerName: phone.customer,
      customerPhone: 'N/A',
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
      warrantyMonths: 6,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=warranty-card-${phone._id}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;