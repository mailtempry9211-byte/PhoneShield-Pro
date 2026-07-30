/**
 * Backup Routes
 * =============================================
 * Defines backup and restore endpoints.
 * All routes are protected by JWT auth middleware.
 *
 * Route Map:
 *   GET  /api/backup/export   - Export database backup as JSON
 *   POST /api/backup/import   - Import JSON backup
 *   GET  /api/backup/stats    - Get database statistics
 * =============================================
 */

const express = require('express');
const { exportBackup, importBackup, getBackupStats } = require('../controllers/backupController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Protect all backup routes with JWT authentication
router.use(authenticate);

router.get('/export', exportBackup);
router.post('/import', importBackup);
router.get('/stats', getBackupStats);

module.exports = router;