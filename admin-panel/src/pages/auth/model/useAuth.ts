import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login, logout, verify } from "./api";

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
    isError,
    refetch,
  } = useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const response = await verify();
        return response;
      } catch (error) {
        console.log(isError)
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
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
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchMe: refetch,
    isLoading: isUserLoading || isFetching,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};
