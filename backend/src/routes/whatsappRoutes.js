/**
 * WhatsApp Routes
 * =============================================
 * Defines WhatsApp share link endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET /api/whatsapp/invoice/:id      - Share invoice
 *   GET /api/whatsapp/repair/:id       - Share repair status
 *   GET /api/whatsapp/phone/:id        - Share phone details
 *   GET /api/whatsapp/receipt/:id      - Share customer receipt
 * =============================================
 */

const express = require('express');
const {
  shareInvoice,
  shareRepairStatus,
  sharePhoneDetails,
  shareCustomerReceipt,
} = require('../services/whatsappService');
const Phone = require('../models/Phone');
const Repair = require('../models/Repair');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all WhatsApp routes with JWT authentication
router.use(authenticate);

/**
 * @route   GET /api/whatsapp/invoice/:id
 * @desc    Generate WhatsApp share link for invoice
 * @access  Private
 */
router.get('/invoice/:id', async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found',
      });
    }

    const phoneNumber = phone.customerPhone || phone.phone || '91';
    const link = shareInvoice(phoneNumber, {
      invoiceNumber: `SAL-${phone._id.toString().slice(-6).toUpperCase()}`,
      customerName: phone.customer || 'Customer',
      totalAmount: phone.sellingPrice || 0,
      date: new Date(phone.createdAt).toLocaleDateString('en-IN'),
    });

    return res.status(200).json({
      success: true,
      link,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/whatsapp/repair/:id
 * @desc    Generate WhatsApp share link for repair status
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

    const link = shareRepairStatus(repair.phoneNumber, {
      repairId: repair.repairId,
      customerName: repair.customer,
      deviceBrand: repair.deviceBrand,
      deviceModel: repair.deviceModel,
      status: repair.status,
      estimatedCost: repair.estimatedCost || 0,
    });

    return res.status(200).json({
      success: true,
      link,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/whatsapp/phone/:id
 * @desc    Generate WhatsApp share link for phone details
 * @access  Private
 */
router.get('/phone/:id', async (req, res, next) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({
        success: false,
        message: 'Phone not found',
      });
    }

    const link = sharePhoneDetails(phone.customerPhone || phone.phone || '91', {
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
      storage: phone.storage,
      color: phone.color,
      sellingPrice: phone.sellingPrice,
      condition: phone.condition,
    });

    return res.status(200).json({
      success: true,
      link,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @route   GET /api/whatsapp/receipt/:id
 * @desc    Generate WhatsApp share link for customer receipt
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

    const link = shareCustomerReceipt(phone.customerPhone || phone.phone || '91', {
      receiptNumber: `REC-${phone._id.toString().slice(-6).toUpperCase()}`,
      customerName: phone.customer || 'Customer',
      items: [
        {
          description: `${phone.brand} ${phone.model}`,
          price: phone.sellingPrice || 0,
        },
      ],
      totalAmount: phone.sellingPrice || 0,
      date: new Date(phone.createdAt).toLocaleDateString('en-IN'),
    });

    return res.status(200).json({
      success: true,
      link,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;