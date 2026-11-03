import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import Badge from '../../components/common/Badge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminBlogs = () => {
  const { articles, deleteArticle } = useBlog();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    if (statusFilter === "All") return articles;
    return articles.filter(a => a.status === statusFilter);
  }, [articles, statusFilter]);

  const handleDelete = () => {
    if (deleteId) {
      deleteArticle(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Articles</h1>
          <p className="text-xs text-slate-500">
            Publish, edit, or remove articles across categories
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/blogs/new')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium shadow-sm">
        <div className="flex space-x-2">
          {["All", "Published", "Draft", "Scheduled"].map(st => {
            const count = st === 'All' ? articles.length : articles.filter(a => a.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">
                      {item.title}
                      {item.isFeatured && (
                        <span className="ml-2 text-[10px] text-blue-600 font-bold uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge label={item.category} variant="secondary" />
                    </td>
                    <td className="p-4 text-slate-500">
                      {item.publishedAt}
                    </td>
                    <td className="p-4">
                      <Badge
                        label={item.status}
                        variant={
                          item.status === 'Published'
                            ? 'success'
                            : item.status === 'Scheduled'
                              ? 'primary'
                              : 'warning'
                        }
                      />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/blogs/edit/${item.id}`)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No articles under "{statusFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        title="Delete Article"
        message="Are you sure you want to delete this article? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminBlogs;
