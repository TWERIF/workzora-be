import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/auth/ui/AuthPage';
import CategoriesPage from './pages/categories/ui/CategoriesPage';
import Layout from './shared/components/Layout';
import ProtectedRoute from './pages/auth/model/protectedRoute';
import AdminChatsView from './pages/chats/AdminChatsView';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path='/chats' element={<AdminChatsView />} />
        </Route>
      </Route>
    </Routes>
  );
}