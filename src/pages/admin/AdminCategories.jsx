import React, { useState } from 'react';
import { Plus, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminCategories = () => {
  const { categories, categoryObjects, addCategory, deleteCategory, articles } = useBlog();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    const val = name.trim();
    if (!val) return;

    if (categories.some(c => c.toLowerCase() === val.toLowerCase())) {
      setError("Category already exists.");
      return;
    }

    try {
      await addCategory(val, description.trim());
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Failed to add category.");
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-xs text-slate-500">
          Organize article topics, taxonomies, and descriptions
        </p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            required
            placeholder="New category name (e.g. Distributed Systems)..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className="sm:col-span-5 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Short description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="sm:col-span-5 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
        {categories.map(cat => {
          const count = articles.filter(a => a.category === cat).length;
          const catObj = categoryObjects.find(c => c.name === cat);
          return (
            <div key={cat} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-3">
                  <FolderTree className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-semibold text-sm text-slate-800">{cat}</span>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count} {count === 1 ? 'post' : 'posts'}
                  </span>
                </div>
                {catObj?.description && (
                  <p className="text-xs text-slate-500 pl-7">{catObj.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(cat)}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                title={`Delete ${cat}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Delete "${deleteTarget}"? Existing articles will retain their category string until edited.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminCategories;
