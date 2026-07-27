import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PostForm from './features/posts/ui/PostForm';
import ProtectedRoute from './pages/auth/model/protectedRoute';
import AuthPage from './pages/auth/ui/AuthPage';
import CategoriesPage from './pages/categories/ui/CategoriesPage';
import AdminChatsView from './pages/chats/AdminChatsView';
import AdminKyc from './pages/kyc/ui/AdminKyc';
import PaymentsPage from './pages/Payments/PaymentsPage';
import PostsPage from './pages/posts/PostsPage';
import Layout from './shared/components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/categories" replace />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/chats" element={<AdminChatsView />} />
          <Route path="/kyc" element={<AdminKyc />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/posts" element={<Outlet />}>
            <Route index element={<PostsPage />} />
            <Route path="create" element={<PostForm />} />
            <Route path="create/:id" element={<PostForm />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}