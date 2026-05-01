import { trpc } from '../lib/trpc';
export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation();
  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: meQuery.isSuccess && !!meQuery.data,
    isError: meQuery.isError,
    logout: () => logoutMutation.mutate({}),
  };
}
