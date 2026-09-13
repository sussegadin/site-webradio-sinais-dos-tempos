import { apiFetch } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => apiFetch<{ authenticated: boolean }>("/api/auth/me"),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = useCallback(
    async (password: string) => {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    queryClient.setQueryData(["auth-me"], { authenticated: false });
  }, [queryClient]);

  return {
    loading: meQuery.isLoading,
    isAuthenticated: Boolean(meQuery.data?.authenticated),
    login,
    logout,
  };
}
