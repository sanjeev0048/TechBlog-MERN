import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { storageService } from '../services/storageService';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES } from '../data/initialData';
import { calculateReadTime } from '../utils/helpers';

export function normalizeArticle(raw) {
  if (!raw) return null;

  const categoryName = typeof raw.category === 'object' && raw.category !== null
    ? (raw.category.name || 'General')
    : (raw.category || 'General');

  const tagList = Array.isArray(raw.tags)
    ? raw.tags.map(t => (typeof t === 'object' && t !== null ? t.name : t))
    : [];

  const authorObj = typeof raw.author === 'object' && raw.author !== null
    ? {
        name: raw.author.name || 'Editorial Staff',
        role: raw.author.role || 'Staff Writer',
        avatar: raw.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      }
    : {
        name: 'Editorial Staff',
        role: 'Staff Writer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      };

  const statusCapitalized = raw.status
    ? raw.status.charAt(0).toUpperCase() + raw.status.slice(1).toLowerCase()
    : 'Published';

  return {
    ...raw,
    id: raw._id ? String(raw._id) : (raw.id || String(Date.now())),
    _id: raw._id || raw.id,
    category: categoryName,
    categoryId: typeof raw.category === 'object' && raw.category !== null ? raw.category._id : raw.category,
    tags: tagList,
    author: authorObj,
    readTime: raw.readTime || calculateReadTime(raw.content || ''),
    status: statusCapitalized,
    rawStatus: (raw.status || 'published').toLowerCase(),
    publishedAt: raw.publishedAt
      ? new Date(raw.publishedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    isPopular: raw.isPopular !== undefined ? raw.isPopular : ((raw.views || 0) > 2500)
  };
}

const BlogContext = createContext(null);

export const BlogProvider = ({ children }) => {
  const [articles, setArticles] = useState(() => {
    const cached = storageService.getArticles(INITIAL_ARTICLES);
    return cached.map(normalizeArticle);
  });

  const [categories, setCategories] = useState(() => 
    storageService.getCategories(INITIAL_CATEGORIES)
  );

  const [categoryObjects, setCategoryObjects] = useState([]);
  const [tags, setTags] = useState([]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('techpulse_token')) || storageService.getAdminAuth();
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('techpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync initial and persistent data from backend
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch categories
      try {
        const catData = await api.getCategories();
        if (Array.isArray(catData) && catData.length > 0) {
          setCategoryObjects(catData);
          const catNames = catData.map(c => c.name);
          setCategories(catNames);
          storageService.saveCategories(catNames);
        }
      } catch (catErr) {
        console.warn('Backend categories endpoint not reachable, using local categories:', catErr.message);
      }

      // Fetch tags
      try {
        const tagData = await api.getTags();
        if (Array.isArray(tagData)) {
          setTags(tagData);
        }
      } catch (tagErr) {
        // Silent fallback
      }

      // Fetch articles
      const hasToken = Boolean(localStorage.getItem('techpulse_token'));
      let fetchedArticles = [];

      if (hasToken) {
        // Authenticated users get all articles (including drafts & scheduled)
        try {
          const adminArticles = await api.getAdminBlogs();
          if (Array.isArray(adminArticles)) {
            fetchedArticles = adminArticles;
          }
        } catch {
          // Fallback to public
          const publicRes = await api.getBlogs('limit=50');
          fetchedArticles = publicRes.blogs || [];
        }
      } else {
        const publicRes = await api.getBlogs('limit=50');
        fetchedArticles = publicRes.blogs || [];
      }

      if (Array.isArray(fetchedArticles) && fetchedArticles.length > 0) {
        const normalized = fetchedArticles.map(normalizeArticle);
        setArticles(normalized);
        storageService.saveArticles(normalized);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend API connection not active, operating in offline/storage mode:', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Article Management
  const addArticle = useCallback(async (data) => {
    try {
      setIsLoading(true);
      const res = await api.createBlog({
        ...data,
        status: (data.status || 'published').toLowerCase(),
        isFeatured: Boolean(data.isFeatured)
      });
      const created = normalizeArticle(res);
      setArticles(prev => {
        const updated = created.isFeatured ? prev.map(a => ({ ...a, isFeatured: false })) : prev;
        return [created, ...updated];
      });
      return created;
    } catch (apiErr) {
      console.error('Failed to create article:', apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateArticle = useCallback(async (id, updates) => {
    try {
      setIsLoading(true);
      const res = await api.updateBlog(id, {
        ...updates,
        ...(updates.status && { status: updates.status.toLowerCase() })
      });
      const updatedArticle = normalizeArticle(res);
      setArticles(prev => prev.map(item => {
        if (item.id === id || item._id === id) {
          return updatedArticle;
        }
        if (updatedArticle.isFeatured) {
          return { ...item, isFeatured: false };
        }
        return item;
      }));
      return updatedArticle;
    } catch (apiErr) {
      console.error('Failed to update article:', apiErr);
      throw apiErr;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteArticle = useCallback(async (id) => {
    try {
      setIsLoading(true);
      await api.deleteBlog(id);
    } catch (apiErr) {
      console.warn('API deleteBlog failed, removing from local state:', apiErr.message);
    } finally {
      setArticles(prev => {
        const nextList = prev.filter(a => a.id !== id && a._id !== id);
        storageService.saveArticles(nextList);
        return nextList;
      });
      setIsLoading(false);
    }
  }, []);

  const incrementArticleViews = useCallback((slug) => {
    setArticles(prev => prev.map(a => 
      a.slug === slug ? { ...a, views: (a.views || 0) + 1 } : a
    ));
  }, []);

  // Category Management
  const addCategory = useCallback(async (name, description = '') => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const res = await api.createCategory({ name: trimmed, description });
      if (res && res.name) {
        setCategories(prev => prev.includes(res.name) ? prev : [...prev, res.name]);
        setCategoryObjects(prev => [...prev, res]);
      }
    } catch (apiErr) {
      console.warn('API createCategory failed, adding locally:', apiErr.message);
      setCategories(prev => {
        const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
        storageService.saveCategories(next);
        return next;
      });
    }
  }, []);

  const deleteCategory = useCallback(async (nameOrId) => {
    // If it's an ObjectId or category object
    const targetObj = categoryObjects.find(c => c._id === nameOrId || c.name === nameOrId);
    const targetId = targetObj?._id || nameOrId;
    const targetName = targetObj?.name || nameOrId;

    try {
      if (targetId && String(targetId).match(/^[0-9a-fA-F]{24}$/)) {
        await api.deleteCategory(targetId);
      }
    } catch (apiErr) {
      console.warn('API deleteCategory failed:', apiErr.message);
    } finally {
      setCategories(prev => {
        const next = prev.filter(c => c !== targetName);
        storageService.saveCategories(next);
        return next;
      });
      setCategoryObjects(prev => prev.filter(c => c._id !== targetId && c.name !== targetName));
    }
  }, [categoryObjects]);

  // Authentication
  const loginAdmin = useCallback(async (email, password) => {
    try {
      const res = await api.login({ email, password });
      // api.login stores the JWT in localStorage
      setIsAdminLoggedIn(true);
      setCurrentUser(res.user);
      storageService.saveAdminAuth(true);
      // Refresh articles with admin privileges
      refreshData();
      return { success: true };
    } catch (err) {
      // No demo fallback – propagate real error
      return { success: false, message: err.message || 'Invalid email or password.' };
    }
  }, [refreshData]);

  const logoutAdmin = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    } finally {
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
      storageService.saveAdminAuth(false);
      refreshData();
    }
  }, [refreshData]);

  return (
    <BlogContext.Provider value={{
      articles,
      categories,
      categoryObjects,
      tags,
      isLoading,
      error,
      isBackendConnected,
      isAdminLoggedIn,
      currentUser,
      refreshArticles: refreshData,
      addArticle,
      updateArticle,
      deleteArticle,
      incrementArticleViews,
      addCategory,
      deleteCategory,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error('useBlog must be used within BlogProvider');
  return ctx;
};
