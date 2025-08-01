import { v2 as cloudinary } from 'cloudinary';
import config from '../config/env.js';

// Configure Cloudinary with credentials from environment variables.
// The config/env.js file already validates that these keys are present.
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer The image buffer from multer to upload.
 * @param {string} folder The folder in Cloudinary to store the image.
 * @returns {Promise<object>} The upload result from Cloudinary.
 */
export const uploadImage = (buffer, folder = 'turfs') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public_id.
 * @param {string} publicId The public_id of the image to delete.
 * @returns {Promise<object>} The deletion result from Cloudinary.
 */
export const deleteImage = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};