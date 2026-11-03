import express from 'express';
import { upload, handleImageUpload } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'editor'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  handleImageUpload
);

export default router;
