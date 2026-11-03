import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getAdminBlogs,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  toggleBlogFeatured
} from '../controllers/blogController.js';
import { checkScheduledPublications } from '../services/scheduler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const validateBlog = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('content').notEmpty().withMessage('Article content is required.'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];

// ----------------------------------------------------------------------
// Specific & Admin Routes (Placed before /:slug to avoid route collision)
// ----------------------------------------------------------------------

router.get('/featured', getFeaturedBlogs);
router.get('/admin/all', protect, authorize('admin', 'editor'), getAdminBlogs);
router.get('/admin/:id', protect, authorize('admin', 'editor'), getAdminBlogById);
router.post('/admin/process-scheduled', protect, authorize('admin'), async (req, res, next) => {
  try {
    const publishedCount = await checkScheduledPublications();
    res.json({ message: `Processed scheduled articles. Published ${publishedCount} article(s).`, publishedCount });
  } catch (err) {
    next(err);
  }
});

// Protected Mutation Routes
router.post('/', protect, authorize('admin', 'editor'), validateBlog, createBlog);
router.patch('/:id/status', protect, authorize('admin', 'editor'), updateBlogStatus);
router.patch('/:id/feature', protect, authorize('admin', 'editor'), toggleBlogFeatured);
router.patch('/:id', protect, authorize('admin', 'editor'), updateBlog);
router.put('/:id', protect, authorize('admin', 'editor'), updateBlog);
router.delete('/:id', protect, authorize('admin'), deleteBlog);

// ----------------------------------------------------------------------
// Public Reading Routes
// ----------------------------------------------------------------------

router.get('/', getBlogs);
router.get('/:slug/related', getRelatedBlogs);
router.get('/:slug', getBlogBySlug);

export default router;
