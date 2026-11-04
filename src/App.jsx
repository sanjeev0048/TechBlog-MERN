import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import BlogListing from './pages/BlogListing';
import BlogDetail from './pages/BlogDetail';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminCategories from './pages/admin/AdminCategories';
import AuthorProfile from './pages/AuthorProfile';

export default function App() {
  return (
    <BlogProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
          <div>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<BlogListing />} />
                <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/author/:slug" element={<AuthorProfile />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blogs"
                  element={
                    <ProtectedRoute>
                      <AdminBlogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blogs/new"
                  element={
                    <ProtectedRoute>
                      <AdminBlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/blogs/edit/:id"
                  element={
                    <ProtectedRoute>
                      <AdminBlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </BlogProvider>
  );
}
