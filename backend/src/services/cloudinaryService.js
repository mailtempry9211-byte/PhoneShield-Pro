/**
 * Cloudinary Upload Service
 * =============================================
 * Handles image uploads to Cloudinary with
 * compression and optimization.
 * =============================================
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single image to Cloudinary from file path.
 *
 * @async
 * @function uploadImage
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result with secure_url
 */
exports.uploadImage = async (filePath, folder = 'phoneshield') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
    });
    return result;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload a single image to Cloudinary from buffer.
 *
 * @async
 * @function uploadImageFromBuffer
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result with secure_url
 */
exports.uploadImageFromBuffer = async (buffer, folder = 'phoneshield') => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          quality: 'auto:good',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return result;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary.
 *
 * @async
 * @function uploadMultipleImages
 * @param {Array<string>} filePaths - Array of local file paths
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array<Object>>} Array of upload results
 */
exports.uploadMultipleImages = async (filePaths, folder = 'phoneshield') => {
  try {
    const uploadPromises = filePaths.map((path) => uploadImage(path, folder));
    const results = await Promise.all(uploadPromises);
    return results.map((r) => r.secure_url);
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary.
 *
 * @async
 * @function deleteImage
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Create a multer middleware for Cloudinary uploads.
 *
 * @function createUploadMiddleware
 * @param {string} folder - Cloudinary folder
 * @param {number} maxFiles - Maximum number of files
 * @returns {Object} Multer middleware
 */
exports.createUploadMiddleware = (folder = 'phoneshield', maxFiles = 5) => {
  // Use memory storage to buffer files, then upload to Cloudinary
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
      }
    },
  });

  return upload.array('images', maxFiles);
};
