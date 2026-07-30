/**
 * Backup Controller
 * =============================================
 * Handles database backup and restore operations:
 *   - Export MongoDB data as JSON
 *   - Import JSON data
 *   - Full database backup
 *
 * All routes protected by JWT auth middleware.
 * =============================================
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');

// List of models to backup
const MODELS = ['User', 'Phone', 'Seller', 'Customer', 'Repair'];

/**
 * Export MongoDB data as JSON.
 *
 * @route GET /api/backup/export
 * @access Private
 */
exports.exportBackup = async (req, res, next) => {
  try {
    const backup = {};

    for (const modelName of MODELS) {
      const Model = mongoose.model(modelName);
      const data = await Model.find({}).lean();
      backup[modelName] = data;
    }

    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Backup exported successfully',
      filename,
      path: filepath,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Import JSON data into MongoDB.
 *
 * @route POST /api/backup/import
 * @access Private
 */
exports.importBackup = async (req, res, next) => {
  try {
    const { filepath } = req.body;

    if (!filepath || !fs.existsSync(filepath)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path',
      });
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    for (const modelName of Object.keys(data)) {
      if (MODELS.includes(modelName)) {
        const Model = mongoose.model(modelName);
        await Model.deleteMany({});
        await Model.insertMany(data[modelName]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Backup imported successfully',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get database statistics.
 *
 * @route GET /api/backup/stats
 * @access Private
 */
exports.getBackupStats = async (req, res, next) => {
  try {
    const stats = {};

    for (const modelName of MODELS) {
      const Model = mongoose.model(modelName);
      const count = await Model.countDocuments();
      stats[modelName] = count;
    }

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    return next(err);
  }
};