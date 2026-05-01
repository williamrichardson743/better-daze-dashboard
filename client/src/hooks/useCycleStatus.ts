import { trpc } from '../lib/trpc';
export function useCycleStatus() {
  const statusQuery = trpc.dashboard.cycleStatus.useQuery(undefined, { refetchInterval: 5000 });
  return {
    cycle: statusQuery.data,
    isLoading: statusQuery.isLoading,
    isRunning: statusQuery.data?.status === 'running',
    progress: statusQuery.data?.progress || 0,
    currentPhase: statusQuery.data?.currentPhase || 0,
    refetch: statusQuery.refetch,
  };
}
