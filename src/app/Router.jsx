import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProfileLayout from '../components/layout/ProfileLayout';

// Pages
import Login from '../features/auth/routes/Login';
import Register from '../features/auth/routes/Register';
import Dashboard from '../features/news/routes/Dashboard';
import SearchResults from '../features/news/routes/SearchResults';
import AddNews from '../features/news/routes/AddNews';
import NewsDetailPage from '../features/news/routes/NewsDetailPage';
import Profile from '../features/profile/routes/Profile';
import BookmarkPage from '../features/bookmark/routes/BookmarkPage';
import MyWorksPage from '../features/myworks/routes/MyWorksPage';
import EditNewsForm from '../features/news/components/EditNewsForm';
import AdminReportPage from '../features/admin/AdminReportPage'; // ✅ pastikan file ini ada

// 🔒 Route untuk pengguna login
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 🛡️ Route khusus admin
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const Router = () => {
  return (
    <Routes>
      {/* 🌐 Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
      </Route>

      {/* 🔑 Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* 🔐 Protected user routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="add-news" element={<AddNews />} />
        <Route path="bookmarks" element={<BookmarkPage />} />
        <Route path="my-works" element={<MyWorksPage />} />
        <Route path="edit-news/:id" element={<EditNewsForm />} />
      </Route>

      {/* 👤 Profile routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>

      {/* 🛡️ Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route path="reports" element={<AdminReportPage />} />
      </Route>

      {/* 🔁 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
