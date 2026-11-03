import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, LayoutDashboard, LogOut, Lock, Menu, X } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

const Header = () => {
  const { isAdminLoggedIn, logoutAdmin } = useBlog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    const val = query.trim();
    if (val) {
      navigate(`/blogs?search=${encodeURIComponent(val)}`);
      setQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Tech<span className="text-blue-600">Pulse</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs mx-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-full text-sm text-slate-800 transition-all border border-transparent"
          />
        </form>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 transition-colors'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              isActive && location.pathname === '/blogs' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900 transition-colors'
            }
          >
            Articles
          </NavLink>

          {isAdminLoggedIn ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-5">
              <NavLink
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </NavLink>
              <button
                type="button"
                onClick={logoutAdmin}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-600 font-semibold text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-800 focus:outline-none"
            />
          </form>

          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            Home
          </NavLink>
          <NavLink
            to="/blogs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-slate-700 border-b border-slate-100"
          >
            All Articles
          </NavLink>

          {isAdminLoggedIn ? (
            <div className="space-y-2 pt-2">
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 font-semibold text-blue-600"
              >
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-red-600 font-medium"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 font-semibold text-slate-700"
            >
              Admin Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
