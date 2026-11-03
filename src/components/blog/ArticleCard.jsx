import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { getAssetUrl } from '../../services/api';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80";

const ArticleCard = ({ article }) => {
  return (
    <Link
      to={`/blogs/${article.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative overflow-hidden aspect-[16/9] bg-slate-100">
        <img
          src={getAssetUrl(article.featuredImage) || FALLBACK_IMAGE}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge label={article.category} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
            {article.title}
          </h3>
          <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <img
              src={article.author?.avatar}
              alt={article.author?.name}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
              }}
            />
            <span className="font-medium text-slate-700 truncate max-w-[100px] sm:max-w-[120px]">
              {article.author?.name}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {article.publishedAt}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {article.readTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
