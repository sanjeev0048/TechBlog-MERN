import express from 'express';
import { Article } from '../models/Article.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/articles - Fetch articles with optional category and search query
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/articles/:slug - Fetch single article by slug and increment views
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/articles - Create article (Protected)
router.post('/', protect, async (req, res) => {
  try {
    if (req.body.isFeatured) {
      await Article.updateMany({}, { isFeatured: false });
    }

    const article = new Article(req.body);
    const created = await article.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/articles/:id - Update article (Protected)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.body.isFeatured) {
      await Article.updateMany({ _id: { $ne: req.params.id } }, { isFeatured: false });
    }

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/articles/:id - Delete article (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
