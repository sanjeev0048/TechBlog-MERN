import path from 'path';
import fs from 'fs';
import multer from 'multer';

const UPLOAD_DIR = path.resolve('uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

export function handleImageUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Construct absolute or relative usable path
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
}
