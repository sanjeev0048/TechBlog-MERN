const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('techpulse_token');
  
  const headers = {
    ...(!options.isFormData && { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.isFormData) {
    delete config.isFormData;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    // Token expired or invalid
    localStorage.removeItem('techpulse_token');
    localStorage.removeItem('techpulse_admin_auth');
    localStorage.removeItem('techpulse_user');
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.message) message = errData.message;
    } catch (_) {
      const text = await res.text();
      if (text) message = text;
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export const api = {
  // Public Blog Endpoints
  getBlogs: (params = '') => request(`/blogs${params ? `?${params}` : ''}`),
  getFeaturedBlogs: () => request('/blogs/featured'),
  getBlogBySlug: (slug) => request(`/blogs/${slug}`),
  getRelatedBlogs: (slug) => request(`/blogs/${slug}/related`),

  // Admin Blog Endpoints
  getAdminBlogs: (status = '') => request(`/blogs/admin/all${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getAdminBlogById: (id) => request(`/blogs/admin/${id}`),
  createBlog: (data) => request('/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id, data) => request(`/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBlog: (id) => request(`/blogs/${id}`, { method: 'DELETE' }),
  updateBlogStatus: (id, status) => request(`/blogs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleBlogFeatured: (id, isFeatured) => request(`/blogs/${id}/feature`, { method: 'PATCH', body: JSON.stringify({ isFeatured }) }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request('/tags'),
  createTag: (data) => request('/tags', { method: 'POST', body: JSON.stringify(data) }),
  deleteTag: (id) => request(`/tags/${id}`, { method: 'DELETE' }),

  // Image Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/uploads', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // Auth
  login: async (creds) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds)
    });
    if (data.token) {
      localStorage.setItem('techpulse_token', data.token);
      localStorage.setItem('techpulse_admin_auth', 'true');
      localStorage.setItem('techpulse_user', JSON.stringify(data.user));
    }
    return data;
  },
  getProfile: () => request('/auth/me'),
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('techpulse_token');
      localStorage.removeItem('techpulse_admin_auth');
      localStorage.removeItem('techpulse_user');
    }
  }
};

export default api;
