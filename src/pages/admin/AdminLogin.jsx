import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';

const AdminLogin = () => {
  const { loginAdmin, isAdminLoggedIn } = useBlog();
  const [email, setEmail] = useState("admin@techpulse.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard';

  if (isAdminLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center max-w-md mx-auto px-4 py-12">
      <div className="w-full bg-white rounded-xl border border-slate-200 shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-xl mb-1 border border-blue-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Sign In</h1>
          <p className="text-xs text-slate-500">
            Enter your credentials to access the editorial dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-100">
          Demo: <span className="font-mono text-slate-700 font-semibold">admin@techpulse.com</span> / <span className="font-mono text-slate-700 font-semibold">admin123</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
