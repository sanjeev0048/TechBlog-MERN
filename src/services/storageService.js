const KEYS = {
  ARTICLES: 'techpulse_articles',
  CATEGORIES: 'techpulse_categories',
  AUTH: 'techpulse_admin_auth'
};

export const storageService = {
  getArticles(fallback = []) {
    try {
      const data = localStorage.getItem(KEYS.ARTICLES);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  saveArticles(articles) {
    try {
      localStorage.setItem(KEYS.ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  },

  getCategories(fallback = []) {
    try {
      const data = localStorage.getItem(KEYS.CATEGORIES);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Could not persist categories', e);
    }
  },

  getAdminAuth() {
    return localStorage.getItem(KEYS.AUTH) === 'true';
  },

  saveAdminAuth(isAuthed) {
    localStorage.setItem(KEYS.AUTH, isAuthed ? 'true' : 'false');
  }
};
