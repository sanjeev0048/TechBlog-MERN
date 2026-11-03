import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content body is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    author: {
      name: { type: String, default: 'Editorial Staff' },
      role: { type: String, default: 'Author' },
      avatar: { type: String, default: '' }
    },
    publishedAt: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    featuredImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
      index: true
    },
    views: {
      type: Number,
      default: 0
    },
    seoTitle: {
      type: String,
      default: ''
    },
    seoDescription: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Article = mongoose.model('Article', articleSchema);
