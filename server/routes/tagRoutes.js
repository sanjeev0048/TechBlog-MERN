import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const validateTag = [
  body('name').trim().notEmpty().withMessage('Tag name is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

// Public
router.get('/', getTags);

// Protected
router.post('/', protect, authorize('admin', 'editor'), validateTag, createTag);
router.put('/:id', protect, authorize('admin', 'editor'), updateTag);
router.patch('/:id', protect, authorize('admin', 'editor'), updateTag);
router.delete('/:id', protect, authorize('admin'), deleteTag);

export default router;
