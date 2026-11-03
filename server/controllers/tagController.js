import Tag from '../models/Tag.js';
import Blog from '../models/Blog.js';
import { slugify } from '../utils/slugify.js';

export async function getTags(req, res, next) {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    next(err);
  }
}

export async function createTag(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tag name is required.' });
    }

    const trimmed = name.trim();
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(trimmed);

    const existing = await Tag.findOne({
      $or: [{ name: trimmed }, { slug }]
    });

    if (existing) {
      return res.status(409).json({ message: 'Tag already exists.' });
    }

    const tag = await Tag.create({ name: trimmed, slug });
    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
}

export async function updateTag(req, res, next) {
  try {
    const { name, slug } = req.body;
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found.' });
    }

    if (name && name.trim()) {
      const trimmed = name.trim();
      const newSlug = slug ? slugify(slug) : slugify(trimmed);

      const conflict = await Tag.findOne({
        _id: { $ne: req.params.id },
        $or: [{ name: trimmed }, { slug: newSlug }]
      });

      if (conflict) {
        return res.status(409).json({ message: 'Tag name or slug already in use.' });
      }

      tag.name = trimmed;
      tag.slug = newSlug;
      await tag.save();
    }

    res.json(tag);
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req, res, next) {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found.' });
    }

    // Clean up references from blogs
    await Blog.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
    await Tag.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tag removed successfully.' });
  } catch (err) {
    next(err);
  }
}
