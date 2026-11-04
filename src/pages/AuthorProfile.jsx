import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import ArticleCard from '../components/blog/ArticleCard';
import { slugify } from '../utils/helpers';
import { ChevronRight } from 'lucide-react';

const AuthorProfile = () => {
  const { slug } = useParams();
  const { articles, isLoading } = useBlog();
  const [author, setAuthor] = useState(null);
  const [authorArticles, setAuthorArticles] = useState([]);

  useEffect(() => {
    if (!isLoading && articles.length) {
      const found = articles.find(
        (a) => a.author?.name && slugify(a.author.name) === slug
      );
      if (found) {
        const name = found.author.name;
        const role = found.author.role;
        const avatar = found.author.avatar;
        const bio = found.author.bio;
        setAuthor({ name, role, avatar, bio });
        const published = articles.filter(
          (a) =>
            a.author?.name && slugify(a.author.name) === slug && a.status === 'Published'
        );
        setAuthorArticles(published);
      } else {
        setAuthor(null);
        setAuthorArticles([]);
      }
    }
  }, [isLoading, articles, slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Author Not Found</h2>
        <p className="mt-2 text-slate-600">We couldn't find an author matching the requested profile.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Author Header */}
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-24 h-24 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
          }}
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{author.name}</h1>
          <p className="text-slate-500">{author.role}</p>
          {author.bio && <p className="mt-2 text-slate-600 max-w-prose">{author.bio}</p>}
          <p className="mt-2 text-sm text-slate-500">
            Published articles: {authorArticles.length}
          </p>
        </div>
      </div>

      {/* Articles List */}
      {authorArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorArticles.map((article) => (
            <Link key={article.id} to={`/blogs/${article.slug}`}>
              <ArticleCard article={article} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600">No published articles found for this author.</p>
      )}
    </section>
  );
};

export default AuthorProfile;
