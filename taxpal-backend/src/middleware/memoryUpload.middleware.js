const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.webp', '.heic', '.heif'];
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';

  if (isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Only images (.jpg, .jpeg, .png) and PDF files (.pdf) are allowed'));
  }
};

const memoryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = {
  memoryUpload,
};
