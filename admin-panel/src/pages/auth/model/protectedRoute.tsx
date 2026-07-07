import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg dark:bg-bg-dark text-text dark:text-text-dark">
        <span>Завантаження...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}