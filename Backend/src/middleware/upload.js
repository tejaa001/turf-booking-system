import multer from 'multer';

// We'll use memory storage, which is great for processing files before uploading to a cloud service.
const storage = multer.memoryStorage();

// Filter to ensure only image files are uploaded.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Reject the file if it's not an image
    cb(new Error('Invalid file type. Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware to handle multiple image uploads from a field named 'images'
export const uploadTurfImages = upload.array('images', 10);