import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { slugify } from '../../utils/helpers';
import api, { getAssetUrl } from '../../services/api';

const DEFAULT_COVER = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, categories, addArticle, updateArticle } = useBlog();
  const fileInputRef = useRef(null);

  const isEditing = Boolean(id);
  const existing = useMemo(() => isEditing ? articles.find(a => a.id === id || a._id === id) : null, [articles, id, isEditing]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: categories[0] || "Software Development",
    excerpt: "",
    content: "",
    featuredImage: DEFAULT_COVER,
    status: "Published",
    scheduledAt: "",
    isFeatured: false,
    tags: "",
    seoTitle: "",
    seoDescription: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        slug: existing.slug || "",
        category: existing.category || categories[0] || "Software Development",
        excerpt: existing.excerpt || "",
        content: existing.content || "",
        featuredImage: existing.featuredImage || DEFAULT_COVER,
        status: existing.status || "Published",
        scheduledAt: existing.scheduledAt ? new Date(existing.scheduledAt).toISOString().slice(0, 16) : "",
        isFeatured: Boolean(existing.isFeatured),
        tags: Array.isArray(existing.tags) ? existing.tags.join(", ") : "",
        seoTitle: existing.seoTitle || "",
        seoDescription: existing.seoDescription || ""
      });
    }
  }, [existing, categories]);

  const onTitleChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({
      ...prev,
      title: val,
      slug: isEditing ? prev.slug : slugify(val)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file exceeds 5MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage("");
      const res = await api.uploadImage(file);
      if (res.url) {
        setForm(prev => ({ ...prev, featuredImage: res.url }));
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to upload image. Server upload endpoint may be offline.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setErrorMessage("Please fill in all required fields (title, excerpt, content).");
      return;
    }

    if (form.status.toLowerCase() === 'scheduled' && !form.scheduledAt) {
      setErrorMessage("Please select a date and time for scheduled publication.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        scheduledAt: form.status.toLowerCase() === 'scheduled' && form.scheduledAt ? new Date(form.scheduledAt) : null
      };

      if (isEditing) {
        await updateArticle(id, payload);
      } else {
        await addArticle(payload);
      }

      navigate('/admin/blogs');
    } catch (err) {
      setErrorMessage(err.message || "Failed to save article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditing ? "Edit Article" : "New Article"}
          </h1>
          <p className="text-xs text-slate-500">
            Write your content, upload media, set taxonomies, and configure SEO details
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/blogs')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={onTitleChange}
              placeholder="Article title..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="article-url-slug"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Publication Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <span className="ml-2 text-xs font-semibold text-slate-700">
                Pin to Homepage
              </span>
            </label>
          </div>
        </div>

        {/* Scheduled time input when status is scheduled */}
        {form.status.toLowerCase() === 'scheduled' && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <label className="block text-xs font-semibold text-blue-900">
              Scheduled Publication Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <p className="text-[11px] text-blue-600">
              The article will automatically transition to Published when this time arrives.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Short Excerpt *
          </label>
          <textarea
            rows={2}
            required
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Brief 1-2 sentence preview for search & index cards..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Content *
            </label>
            <span className="text-[11px] text-slate-400">
              Markdown (## headers, ```code, - lists)
            </span>
          </div>
          <textarea
            rows={10}
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your article in markdown..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Featured Image & File Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Featured Cover Image
          </label>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8">
              <input
                type="text"
                value={form.featuredImage}
                onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                placeholder="Image URL or upload a file..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "Uploading..." : "Upload File"}</span>
              </button>
            </div>
          </div>

          {/* Image Preview */}
          {form.featuredImage && (
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-16 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={getAssetUrl(form.featuredImage)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER;
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-500 truncate max-w-md">
                Preview: {form.featuredImage}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Microservices, Cloud, React, Security"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            SEO Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder="Custom title tag..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <input
                type="text"
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder="Custom meta description..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Publish")}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/blogs')}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditor;
