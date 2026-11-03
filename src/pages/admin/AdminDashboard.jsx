import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, Check, BarChart3, FolderTree, Edit, ArrowRight } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import Badge from '../../components/common/Badge';

const AdminDashboard = () => {
  const { articles, isBackendConnected } = useBlog();
  const navigate = useNavigate();

  const totalPublished = articles.filter(a => a.status === 'Published').length;
  const totalDrafts = articles.filter(a => a.status === 'Draft').length;
  const totalViews = articles.reduce((sum, item) => sum + (item.views || 0), 0);
  const recentArticles = articles.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              isBackendConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{isBackendConnected ? 'MongoDB Live' : 'Local Storage Mode'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overview of publication metrics and content status
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/blogs/new')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Posts</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{articles.length}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Published</span>
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPublished}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Drafts</span>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalDrafts}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Reads</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-3">
        <Link
          to="/admin/blogs"
          className="px-4 py-2 bg-white border border-slate-300 hover:border-blue-600 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Manage Articles</span>
        </Link>
        <Link
          to="/admin/categories"
          className="px-4 py-2 bg-white border border-slate-300 hover:border-blue-600 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <FolderTree className="w-4 h-4 text-blue-600" />
          <span>Manage Categories</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Posts</h2>
          <Link
            to="/admin/blogs"
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center"
          >
            View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400 font-semibold">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentArticles.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-800 max-w-xs truncate pr-4">
                    {item.title}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge label={item.category} variant="secondary" />
                  </td>
                  <td className="py-3 text-slate-500 pr-4">{item.publishedAt}</td>
                  <td className="py-3 pr-4">
                    <Badge
                      label={item.status}
                      variant={item.status === 'Published' ? 'success' : 'warning'}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/blogs/edit/${item.id}`)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
