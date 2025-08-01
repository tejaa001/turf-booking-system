import Turf from '../models/Turf.js';
import { uploadImage, deleteImage } from './cloudinaryService.js';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

// Helper function to invalidate the Redis cache for turf listings.
// This ensures that any changes to turfs are reflected immediately for users.
const clearTurfCache = async () => {
  const redisClient = getRedisClient();
  if (!redisClient) return;
  try {
    const keys = await redisClient.keys('turfs:*');
    if (keys.length > 0) await redisClient.del(keys);
  } catch (err) {
    logger.error('Redis cache invalidation error:', err);
  }
};
// Helper function to upload multiple image files and return their URLs
const uploadAndGetUrls = async (files) => {
  if (!files || files.length === 0) return [];

  // Upload all files concurrently
  const uploadPromises = files.map(file => uploadImage(file.buffer));
  const results = await Promise.all(uploadPromises);

  // Return an array of objects with the URL and public_id
  return results.map(result => ({ url: result.secure_url, public_id: result.public_id }));
};

export const addTurf = async (turfData) => {
  // Upload images to Cloudinary and get back the URLs
  const imageUrls = await uploadAndGetUrls(turfData.images);

  // Create a new turf document with the Cloudinary URLs
  const newTurf = new Turf({
    ...turfData,
    images: imageUrls, // Overwrite the file objects with the URLs
  });

  await newTurf.save();
  await clearTurfCache();
  return newTurf;
};

export const updateTurf = async (turfId, updateData) => {
  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new Error('Turf not found');
  }

  const { images: newImageFiles, imagesToDelete, ...otherUpdates } = updateData;

  // 1. Handle image deletions
  if (imagesToDelete && imagesToDelete.length > 0) {
    // Concurrently delete from Cloudinary
    const deletionPromises = imagesToDelete.map(publicId => deleteImage(publicId));
    await Promise.all(deletionPromises);

    // Remove from the turf's images array in the database
    await Turf.updateOne(
      { _id: turfId },
      { $pull: { images: { public_id: { $in: imagesToDelete } } } }
    );
  }

  // If new images are being uploaded, handle them
  if (newImageFiles && newImageFiles.length > 0) {
    const newImageObjects = await uploadAndGetUrls(newImageFiles);
    // Add new images to the turf's images array
    await Turf.updateOne(
      { _id: turfId },
      { $push: { images: { $each: newImageObjects } } }
    );
  }

  // 3. Update other text-based fields
  Object.assign(turf, otherUpdates);
  await turf.save();
  await clearTurfCache();

  return await Turf.findById(turfId); // Return the fully updated document
};

export const getAllTurfs = async (filter = {}, options = {}) => {
  const redisClient = getRedisClient();
  const cacheKey = `turfs:${JSON.stringify(filter)}:${JSON.stringify(options)}`;

  // 1. Try to fetch from cache first
  if (redisClient) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.error('Redis cache read error:', err);
    }
  }

  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const turfs = await Turf.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalTurfs = await Turf.countDocuments(filter);

  const data = {
    turfs,
    totalPages: Math.ceil(totalTurfs / limit),
    currentPage: parseInt(page, 10),
  };

  // 3. Store the result in the cache for future requests
  if (redisClient) {
    try {
      // Cache for 5 minutes (300 seconds)
      await redisClient.set(cacheKey, JSON.stringify(data), { EX: 300 });
    } catch (err) {
      console.error('Redis cache write error:', err);
    }
  }

  return data;
};

export const getTurfById = async (id) => {
  const turf = await Turf.findById(id);
  if (!turf) throw new Error('Turf not found');
  return turf;
};

export const deleteTurf = async (id) => {
  // First, find the turf to get the public_ids of the images
  const turf = await Turf.findById(id);
  if (turf?.images?.length > 0) {
    // Filter out any images that might not have a public_id (for backward compatibility)
    // and create an array of deletion promises.
    const deletionPromises = turf.images
      .filter(image => image && image.public_id)
      .map(image => deleteImage(image.public_id));
    // Concurrently delete all images from Cloudinary
    await Promise.all(deletionPromises);
  }

  const result = await Turf.findByIdAndDelete(id);
  await clearTurfCache();
  if (!result) throw new Error('Turf not found');
  return result;
};

export const toggleTurfStatus = async (id, isActive) => {
  const turf = await Turf.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!turf) throw new Error('Turf not found');
  await clearTurfCache();
  return turf;
};

/**
 * Updates the average rating for a turf and invalidates the cache.
 * This centralizes the rating update logic.
 * @param {string} turfId - The ID of the turf to update.
 * @param {number} newAverage - The new average rating.
 */
export const updateTurfRating = async (turfId, newAverage) => {
  await Turf.findByIdAndUpdate(turfId, { averageRating: newAverage.toFixed(1) });
  await clearTurfCache();
};