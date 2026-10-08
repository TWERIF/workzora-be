import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login, logout, verify } from "./api";
import { UserRole, type User } from "./types";

export const NOT_ADMIN = "NOT_ADMIN";

export const authKeys = {
  me: ["me"] as const,
};

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading: isUserLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: authKeys.me,
    queryFn: () => verify().catch(() => null),
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const data: { user: User } = await login(credentials);
      if (data.user?.role !== UserRole.ADMIN) throw new Error(NOT_ADMIN);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user);
      navigate("/categories");
    },
  });


  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.clear();
      navigate("/auth");
    },
  });

  return {
    user,
    isAuthenticated: user?.role === UserRole.ADMIN,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchMe: refetch,
    isLoading: isUserLoading || isFetching,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};
