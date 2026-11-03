import Category from '../models/Category.js';
import Blog from '../models/Blog.js';
import { slugify } from '../utils/slugify.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Calculate article counts per category for public/admin display
    const counts = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = counts.reduce((acc, curr) => {
      acc[String(curr._id)] = curr.count;
      return acc;
    }, {});

    const enriched = categories.map(cat => ({
      ...cat.toJSON(),
      articleCount: countMap[String(cat._id)] || 0
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(trimmedName);

    const existing = await Category.findOne({
      $or: [{ name: trimmedName }, { slug }]
    });

    if (existing) {
      return res.status(409).json({ message: 'Category name or slug already exists.' });
    }

    const category = await Category.create({
      name: trimmedName,
      slug,
      description: description?.trim() || ''
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { name, slug, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const newSlug = slug ? slugify(slug) : slugify(trimmedName);

      const conflict = await Category.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name: trimmedName }, { slug: newSlug }]
      });

      if (conflict) {
        return res.status(409).json({ message: 'Another category with this name or slug already exists.' });
      }

      category.name = trimmedName;
      category.slug = newSlug;
    }

    if (typeof description === 'string') {
      category.description = description.trim();
    }

    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const referencedCount = await Blog.countDocuments({ category: category._id });
    if (referencedCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is referenced by ${referencedCount} article(s). Please reassign or delete those articles first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed successfully.' });
  } catch (err) {
    next(err);
  }
}
