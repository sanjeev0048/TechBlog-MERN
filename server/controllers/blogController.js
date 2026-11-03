import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import { slugify } from '../utils/slugify.js';

// Resolve Category ID from ID, slug, or name
async function resolveCategory(categoryInput) {
  if (!categoryInput) return null;
  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    const existing = await Category.findById(categoryInput);
    if (existing) return existing._id;
  }
  const bySlugOrName = await Category.findOne({
    $or: [{ slug: slugify(categoryInput) }, { name: categoryInput.trim() }]
  });
  if (bySlugOrName) return bySlugOrName._id;
  // If not found, create new category
  const newCat = await Category.create({
    name: categoryInput.trim(),
    slug: slugify(categoryInput)
  });
  return newCat._id;
}

// Resolve Tags array (supports IDs, names, or comma-separated strings)
async function resolveTags(tagsInput) {
  if (!tagsInput) return [];
  const rawList = Array.isArray(tagsInput)
    ? tagsInput
    : typeof tagsInput === 'string'
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  const tagIds = [];
  for (const item of rawList) {
    if (mongoose.Types.ObjectId.isValid(item)) {
      const existing = await Tag.findById(item);
      if (existing) {
        tagIds.push(existing._id);
        continue;
      }
    }
    const name = String(item).trim();
    if (!name) continue;
    const slug = slugify(name);
    let tagDoc = await Tag.findOne({ $or: [{ slug }, { name }] });
    if (!tagDoc) {
      tagDoc = await Tag.create({ name, slug });
    }
    tagIds.push(tagDoc._id);
  }
  return tagIds;
}

// Ensure unique slug
async function generateUniqueSlug(title, currentId = null) {
  let baseSlug = slugify(title) || 'untitled-post';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const exists = await Blog.findOne(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

export async function getBlogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    // Search by title or excerpt
    if (req.query.search) {
      const q = req.query.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (req.query.category) {
      const catSlug = slugify(req.query.category);
      const catDoc = await Category.findOne({
        $or: [{ slug: catSlug }, { name: req.query.category }]
      });
      if (catDoc) {
        filter.category = catDoc._id;
      } else if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      } else {
        // Category specified doesn't exist, return empty
        return res.json({
          blogs: [],
          page,
          limit,
          total: 0,
          totalPages: 0
        });
      }
    }

    // Tag filter
    if (req.query.tag) {
      const tagSlug = slugify(req.query.tag);
      const tagDoc = await Tag.findOne({
        $or: [{ slug: tagSlug }, { name: req.query.tag }]
      });
      if (tagDoc) {
        filter.tags = tagDoc._id;
      }
    }

    // Featured only
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Sorting
    let sort = { publishedAt: -1 };
    if (req.query.sort === 'oldest') {
      sort = { publishedAt: 1 };
    } else if (req.query.sort === 'views' || req.query.sort === 'popular') {
      sort = { views: -1, publishedAt: -1 };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name role avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      page,
      limit,
      total,
      totalPages
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedBlogs(req, res, next) {
  try {
    const featured = await Blog.find({ status: 'published', isFeatured: true })
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(5);

    res.json(featured);
  } catch (err) {
    next(err);
  }
}

export async function getBlogBySlug(req, res, next) {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name role avatar')
      .populate('category', 'name slug description')
      .populate('tags', 'name slug');

    if (!blog) {
      return res.status(404).json({ message: 'Article not found or is currently unpublished.' });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function getRelatedBlogs(req, res, next) {
  try {
    const current = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!current) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const filter = {
      _id: { $ne: current._id },
      status: 'published',
      $or: [
        { category: current.category },
        { tags: { $in: current.tags } }
      ]
    };

    const related = await Blog.find(filter)
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(3);

    res.json(related);
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------
// PROTECTED ADMINISTRATIVE ENDPOINTS
// -------------------------------------------------------------

export async function getAdminBlogs(req, res, next) {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'All' && req.query.status !== 'all') {
      filter.status = req.query.status.toLowerCase();
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    next(err);
  }
}

export async function getAdminBlogById(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
}

export async function createBlog(req, res, next) {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status = 'published',
      isFeatured = false,
      scheduledAt,
      seoTitle,
      metaDescription
    } = req.body;

    if (!title || !content || !excerpt) {
      return res.status(400).json({ message: 'Title, excerpt, and content body are required.' });
    }

    const categoryId = await resolveCategory(category);
    if (!categoryId) {
      return res.status(400).json({ message: 'A valid category is required.' });
    }

    const tagIds = await resolveTags(tags);
    const slug = customSlug
      ? await generateUniqueSlug(customSlug)
      : await generateUniqueSlug(title);

    // If new article is featured, unset featured on all others
    if (isFeatured) {
      await Blog.updateMany({}, { isFeatured: false });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const blog = await Blog.create({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content,
      featuredImage,
      author: req.user._id,
      category: categoryId,
      tags: tagIds,
      status: status.toLowerCase(),
      isFeatured: Boolean(isFeatured),
      publishedAt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      seoTitle: seoTitle?.trim() || '',
      metaDescription: metaDescription?.trim() || ''
    });

    const populated = await Blog.findById(blog._id)
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const allowedUpdates = [
      'title', 'slug', 'excerpt', 'content', 'featuredImage',
      'category', 'tags', 'status', 'isFeatured', 'scheduledAt',
      'seoTitle', 'metaDescription', 'publishedAt'
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.title && !updates.slug && updates.title !== blog.title) {
      updates.slug = await generateUniqueSlug(updates.title, blog._id);
    } else if (updates.slug && updates.slug !== blog.slug) {
      updates.slug = await generateUniqueSlug(updates.slug, blog._id);
    }

    if (updates.category) {
      updates.category = await resolveCategory(updates.category);
    }

    if (updates.tags) {
      updates.tags = await resolveTags(updates.tags);
    }

    if (updates.status) {
      updates.status = updates.status.toLowerCase();
      if (updates.status === 'published' && !blog.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    if (updates.isFeatured) {
      await Blog.updateMany({ _id: { $ne: blog._id } }, { isFeatured: false });
    }

    Object.assign(blog, updates);
    await blog.save();

    const populated = await Blog.findById(blog._id)
      .populate('author', 'name role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.json({ message: 'Article removed successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function updateBlogStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'scheduled'].includes(status?.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status. Must be 'draft', 'published', or 'scheduled'." });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    blog.status = status.toLowerCase();
    if (blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    res.json({ message: 'Status updated successfully.', status: blog.status });
  } catch (err) {
    next(err);
  }
}

export async function toggleBlogFeatured(req, res, next) {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    const targetFeatured = req.body.isFeatured !== undefined
      ? Boolean(req.body.isFeatured)
      : !blog.isFeatured;

    if (targetFeatured) {
      await Blog.updateMany({ _id: { $ne: blog._id } }, { isFeatured: false });
    }

    blog.isFeatured = targetFeatured;
    await blog.save();

    res.json({ message: 'Featured status updated.', isFeatured: blog.isFeatured });
  } catch (err) {
    next(err);
  }
}
