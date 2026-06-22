import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Завантаження...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}