import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ChevronRight, ArrowRight, Eye, Mail } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import ArticleCard from '../components/blog/ArticleCard';
import Badge from '../components/common/Badge';
import { getAssetUrl } from '../services/api';

const Home = () => {
  const { articles, categories } = useBlog();

  const published = useMemo(() => articles.filter(a => a.status === 'Published'), [articles]);
  const featured = useMemo(() => published.find(a => a.isFeatured) || published[0], [published]);
  const popular = useMemo(() => published.filter(a => a.isPopular).slice(0, 3), [published]);
  const latest = useMemo(() => {
    if (!featured) return published.slice(0, 6);
    return published.filter(a => a.id !== featured.id).slice(0, 6);
  }, [published, featured]);

  return (
    <div className="space-y-12 pb-16">
      {featured && (
        <section className="bg-gradient-to-b from-blue-50/60 to-transparent pt-6 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] bg-slate-100">
                <img
                  src={getAssetUrl(featured.featuredImage)}
                  alt={featured.title}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>

              <div className="lg:col-span-5 p-6 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge label="FEATURED" variant="primary" />
                    <Badge label={featured.category} variant="secondary" />
                  </div>
                  <Link
                    to={`/blogs/${featured.slug}`}
                    className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mb-4 hover:text-blue-600 block transition-colors"
                  >
                    {featured.title}
                  </Link>
                  <p className="text-slate-600 mb-6 leading-relaxed text-sm lg:text-base line-clamp-3">
                    {featured.excerpt}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-3 mb-6 pt-4 border-t border-slate-100">
                    <img
                      src={featured.author?.avatar}
                      alt={featured.author?.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {featured.author?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {featured.author?.role}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/blogs/${featured.slug}`}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors space-x-2 shadow-sm"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Browse by Topic</h2>
          <Link to="/blogs" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(category => (
            <Link key={category} to={`/blogs?category=${encodeURIComponent(category)}`}>
              <Badge label={category} variant="secondary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Latest Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latest.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Popular Reads
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-sm">
              {popular.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/blogs/${article.slug}`}
                  className="flex space-x-4 group pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <span className="text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                    0{index + 1}
                  </span>
                  <div>
                    <Badge label={article.category} variant="secondary" />
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm mt-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 flex items-center">
                      <Eye className="w-3 h-3 mr-1" /> {article.views} reads
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-800">
              <Mail className="w-7 h-7 text-blue-400 mb-3" />
              <h3 className="font-bold text-base mb-1">Weekly Engineering Digest</h3>
              <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                Hand-picked architecture blueprints and engineering war stories delivered every Friday.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 rounded-lg text-slate-900 text-xs mb-2 focus:outline-none bg-white"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
