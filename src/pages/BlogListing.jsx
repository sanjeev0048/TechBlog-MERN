import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import ArticleCard from '../components/blog/ArticleCard';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 6;

const BlogListing = () => {
  const { articles, categories } = useBlog();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const [selectedCategory, setSelectedCategory] = useState(params.get('category') || '');
  const [searchKeyword, setSearchKeyword] = useState(params.get('search') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    setSelectedCategory(currentParams.get('category') || '');
    setSearchKeyword(currentParams.get('search') || '');
    setPage(1);
  }, [location.search]);

  const filtered = useMemo(() => {
    return articles.filter(item => {
      if (item.status !== 'Published') return false;

      const matchesCat = selectedCategory ? item.category === selectedCategory : true;
      const q = searchKeyword.toLowerCase().trim();
      const matchesSearch = q
        ? item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
        : true;

      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchKeyword]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleFilterChange = (cat, search) => {
    const next = new URLSearchParams();
    if (cat) next.set('category', cat);
    if (search) next.set('search', search);
    navigate(`/blogs?${next.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
            <p className="text-xs text-slate-500">
              Browse technical articles, system design guides, and engineering patterns
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full w-fit">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchKeyword}
              onChange={(e) => handleFilterChange(selectedCategory, e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(e.target.value, searchKeyword)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(selectedCategory || searchKeyword) && (
          <div className="flex items-center space-x-2 pt-2 text-xs flex-wrap gap-y-2">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {selectedCategory && (
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium flex items-center">
                {selectedCategory}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
                  onClick={() => handleFilterChange('', searchKeyword)}
                />
              </span>
            )}
            {searchKeyword && (
              <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium flex items-center">
                "{searchKeyword}"
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900"
                  onClick={() => handleFilterChange(selectedCategory, '')}
                />
              </span>
            )}
            <button
              type="button"
              onClick={() => handleFilterChange('', '')}
              className="text-red-600 hover:underline font-semibold ml-2 text-xs"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No articles found</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Try adjusting your search terms or clearing the selected category.
          </p>
          <button
            type="button"
            onClick={() => handleFilterChange('', '')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogListing;
