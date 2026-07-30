/**
 * Upload Routes
 * =============================================
 * Defines image upload endpoints using Cloudinary.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   POST /api/upload/phone     - Upload phone images
 *   POST /api/upload/seller    - Upload seller documents
 *   POST /api/upload/customer  - Upload customer documents
 *   POST /api/upload/repair    - Upload repair images
 * =============================================
 */

const express = require('express');
const { createUploadMiddleware, uploadImageFromBuffer } = require('../services/cloudinaryService');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all upload routes with JWT authentication
router.use(authenticate);

// Upload phone images
router.post('/phone', createUploadMiddleware('phoneshield/phones', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return uploadImageFromBuffer(file.buffer, 'phoneshield/phones');
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
});

// Upload seller documents
router.post('/seller', createUploadMiddleware('phoneshield/sellers', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents uploaded',
      });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return uploadImageFromBuffer(file.buffer, 'phoneshield/sellers');
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: error.message,
    });
  }
});

// Upload customer documents
router.post('/customer', createUploadMiddleware('phoneshield/customers', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents uploaded',
      });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return uploadImageFromBuffer(file.buffer, 'phoneshield/customers');
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    return res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: error.message,
    });
  }
});

// Upload repair images
router.post('/repair', createUploadMiddleware('phoneshield/repairs', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return uploadImageFromBuffer(file.buffer, 'phoneshield/repairs');
    });

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
});

module.exports = router;