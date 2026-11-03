import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected management routes
router.post('/', protect, authorize('admin', 'editor'), validateCategory, createCategory);
router.put('/:id', protect, authorize('admin', 'editor'), updateCategory);
router.patch('/:id', protect, authorize('admin', 'editor'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
