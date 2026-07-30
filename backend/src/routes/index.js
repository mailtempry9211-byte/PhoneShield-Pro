/**
 * Main API Router
 * =============================================
 * Aggregates all route modules and mounts them
 * under the /api base path. This is the central
 * routing file that connects URLs to controllers.
 *
 * Route Map:
 *   /api/health       -> Health check endpoint
 *   /api/auth/*       -> Authentication endpoints
 *   /api/phones/*     -> Phone inventory CRUD endpoints
 *   /api/sellers/*    -> Seller management CRUD endpoints
 *   /api/customers/*  -> Customer management CRUD endpoints
 *   /api/repairs/*    -> Repair management CRUD endpoints
 *   /api/invoice/*    -> Invoice generation endpoints
 *   /api/dashboard    -> Dashboard statistics endpoint
 * =============================================
 */

const express = require('express');

// Create a new Express router instance
const router = express.Router();

// Import individual route modules
const healthRoutes = require('./health');
const authRoutes = require('./authRoutes');
const phoneRoutes = require('./phoneRoutes');
const sellerRoutes = require('./sellerRoutes');
const customerRoutes = require('./customerRoutes');
const repairRoutes = require('./repairRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./uploadRoutes');
const pdfRoutes = require('./pdfRoutes');
const whatsappRoutes = require('./whatsappRoutes');
const reportRoutes = require('./reportRoutes');
const searchRoutes = require('./searchRoutes');
const backupRoutes = require('./backupRoutes');

/**
 * Mount route modules under their respective paths.
 * Each route module handles its own sub-paths.
 */

// Health check endpoint: GET /api/health
router.use('/health', healthRoutes);

// Authentication endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
router.use('/auth', authRoutes);

// Phone inventory endpoints: CRUD operations (protected by JWT auth)
router.use('/phones', phoneRoutes);

// Seller management endpoints: CRUD operations (protected by JWT auth)
router.use('/sellers', sellerRoutes);

// Customer management endpoints: CRUD operations (protected by JWT auth)
router.use('/customers', customerRoutes);

// Repair management endpoints: CRUD operations (protected by JWT auth)
router.use('/repairs', repairRoutes);

// Invoice generation endpoints (protected by JWT auth)
router.use('/invoice', invoiceRoutes);

// Dashboard statistics endpoint (protected by JWT auth)
router.use('/dashboard', dashboardRoutes);

// Upload endpoints (protected by JWT auth)
router.use('/upload', uploadRoutes);

// PDF generation endpoints (protected by JWT auth)
router.use('/pdf', pdfRoutes);

// WhatsApp share endpoints (protected by JWT auth)
router.use('/whatsapp', whatsappRoutes);

// Report endpoints (protected by JWT auth)
router.use('/reports', reportRoutes);

// Global search endpoint (protected by JWT auth)
router.use('/search', searchRoutes);

// Backup endpoints (protected by JWT auth)
router.use('/backup', backupRoutes);

// Export the aggregated router for use in server.js
module.exports = router;