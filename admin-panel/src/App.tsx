import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PostForm from './features/posts/ui/PostForm';
import ProtectedRoute from './pages/auth/model/protectedRoute';
import AuthPage from './pages/auth/ui/AuthPage';
import CategoriesPage from './pages/categories/ui/CategoriesPage';
import AdminChatsView from './pages/chats/AdminChatsView';
import AdminKyc from './pages/kyc/ui/AdminKyc';
import PaymentsPage from './pages/Payments/PaymentsPage';
import HelpArticleForm from './pages/help/HelpArticleForm';
import HelpPage from './pages/help/HelpPage';
import PostsPage from './pages/posts/PostsPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import StatsPage from './pages/stats/StatsPage';
import SupportPage from './pages/support/SupportPage';
import Layout from './shared/components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/stats" replace />} />

          <Route path="/stats" element={<StatsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/support" element={<SupportPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/chats" element={<AdminChatsView />} />
          <Route path="/kyc" element={<AdminKyc />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/help" element={<Outlet />}>
            <Route index element={<HelpPage />} />
            <Route path="create" element={<HelpArticleForm />} />
            <Route path=":id" element={<HelpArticleForm />} />
          </Route>
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