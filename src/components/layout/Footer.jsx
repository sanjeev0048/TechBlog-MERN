import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

const Footer = () => {
  const { categories } = useBlog();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span>TechPulse</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Blueprints, system architecture breakdowns, and engineering insights for builders and technical leaders.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map(cat => (
                <li key={cat}>
                  <Link
                    to={`/blogs?category=${encodeURIComponent(cat)}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-blue-400 transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-blue-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">
              Newsletter
            </h4>
            <p className="text-xs mb-3 text-slate-400">
              Curated software design patterns and deep dives sent twice a month.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-2.5 rounded-lg">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-slate-800 text-white px-3 py-2 text-xs rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-[11px] text-center md:flex md:justify-between text-slate-500">
          <p>&copy; {new Date().getFullYear()} TechPulse. Built with React and Tailwind CSS.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
