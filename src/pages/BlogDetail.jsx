import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, AlertCircle, Tag } from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { parseHeadings, slugify } from '../utils/helpers';
import Badge from '../components/common/Badge';
import ArticleCard from '../components/blog/ArticleCard';
import TableOfContents from '../components/blog/TableOfContents';
import ShareButtons from '../components/blog/ShareButtons';
import { getAssetUrl } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BlogDetail = () => {
  const { slug } = useParams();
  const { articles, incrementArticleViews } = useBlog();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      incrementArticleViews(slug);
    }
  }, [slug, incrementArticleViews]);

  const article = useMemo(() => {
    return articles.find(a => a.slug === slug);
  }, [articles, slug]);

  const related = useMemo(() => {
    if (!article) return [];
    // Show other published articles by the same author
    return articles
      .filter(a => a.id !== article.id && a.author?.name === article.author?.name && a.status === 'Published')
      .slice(0, 3);
  }, [articles, article]);

  const headings = useMemo(() => {
    return article?.content ? parseHeadings(article.content) : [];
  }, [article]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-slate-500 text-sm">
          The requested article could not be located. It may have been moved or unpublished.
        </p>
        <Link
          to="/blogs"
          className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <article className="pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <nav className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link to="/blogs" className="hover:text-blue-600">Articles</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-[300px]">
            {article.title}
          </span>
        </nav>
      </div>

      <header className="max-w-4xl mx-auto px-4 space-y-4 mb-8">
        <Badge label={article.category} />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-between border-y border-slate-200 py-4 text-sm text-slate-600">
          <div className="flex items-center space-x-3">
            <img
              src={article.author?.avatar}
              alt={article.author?.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
              }}
            />
            <div>
              <div className="font-semibold text-slate-900"><Link to={`/author/${slugify(article.author?.name || '')}`} className="font-semibold text-slate-900 hover:underline">{article.author?.name}</Link></div>
              <div className="text-xs text-slate-500">{article.author?.role}</div>
{article.author?.bio && (
  <p className="text-sm text-slate-600 mt-1">{article.author?.bio}</p>
)}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {article.publishedAt}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mb-10">
        <div className="aspect-[21/9] rounded-xl overflow-hidden shadow-sm bg-slate-100">
          <img
            src={getAssetUrl(article.featuredImage)}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ShareButtons title={article.title} />

        <div className="lg:col-span-8 space-y-6 text-slate-800 leading-relaxed text-base">
          {article.excerpt && (
            <p className="text-lg font-medium text-slate-600 italic border-l-4 border-blue-600 pl-4 py-1 bg-blue-50/50 rounded-r-lg">
              {article.excerpt}
            </p>
          )}

          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = typeof children === 'string' ? children : String(children);
                  const id = slugify(text);
                  return (
                    <h2
                      id={id}
                      className="text-2xl font-bold text-slate-900 pt-4 mb-2 border-b border-slate-100 pb-2 scroll-mt-20"
                    >
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const text = typeof children === 'string' ? children : String(children);
                  const id = slugify(text);
                  return (
                    <h3
                      id={id}
                      className="text-xl font-semibold text-slate-900 pt-3 mb-2 scroll-mt-20"
                    >
                      {children}
                    </h3>
                  );
                },
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-slate-900 pt-2 mb-1">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-slate-700 leading-relaxed mb-4">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-slate-600">{children}</em>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-600 underline hover:text-blue-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700 mb-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-700 mb-4">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-700 leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50/50 rounded-r-lg text-slate-600 italic">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, className, children }) => {
                  if (inline) {
                    return (
                      <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="my-4 rounded-xl overflow-x-auto border border-slate-800 bg-slate-900 text-slate-100 p-4 text-xs font-mono shadow-inner">
                      <pre><code className={className}>{children}</code></pre>
                    </div>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-slate-200 text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-100 text-slate-700 font-semibold">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-slate-200 px-3 py-2 text-left">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-slate-200 px-3 py-2">{children}</td>
                ),
                hr: () => <hr className="my-6 border-slate-200" />,
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ''}
                    className="rounded-lg my-4 max-w-full h-auto"
                    loading="lazy"
                  />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {article.tags?.length > 0 && (
            <div className="flex items-center space-x-2 pt-6 border-t border-slate-200 text-xs flex-wrap gap-y-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-600">Tags:</span>
              {article.tags.map(t => (
                <span
                  key={t}
                  className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-10 flex items-center space-x-4 shadow-sm">
            <img
              src={article.author?.avatar}
              alt={article.author?.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
              }}
            />
            <div>
              <h4 className="font-bold text-slate-900"><Link to={`/author/${slugify(article.author?.name || '')}`} className="font-semibold text-slate-900 hover:underline">{article.author?.name}</Link></h4>
              <p className="text-xs text-slate-500 mb-1">{article.author?.role}</p>
              <p className="text-xs text-slate-600">
                Staff writer covering software architecture, cloud platforms, and distributed systems.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 hidden lg:block">
          <TableOfContents headings={headings} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 mt-16 pt-10 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map(item => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogDetail;
