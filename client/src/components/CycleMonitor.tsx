import { trpc } from '../lib/trpc';

const PHASES = [
  { num: 1, name: 'Trend Ingestion', icon: '🔍' },
  { num: 2, name: 'Design Generation', icon: '🎨' },
  { num: 3, name: 'Printify Upload', icon: '🖨️' },
  { num: 4, name: 'Content Generation', icon: '🎬' },
  { num: 5, name: 'Social Distribution', icon: '📱' },
  { num: 6, name: 'Performance Optimization', icon: '📊' },
];

export default function CycleMonitor() {
  const statusQuery = trpc.dashboard.cycleStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const triggerMutation = trpc.cycle.trigger.useMutation({
    onSuccess: () => statusQuery.refetch(),
  });

  const cycle = statusQuery.data;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Cycle Status</h3>
        <button
          onClick={() => triggerMutation.mutate({})}
          disabled={triggerMutation.isPending || (cycle?.status === 'running')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {triggerMutation.isPending ? 'Starting...' : 'Run Cycle'}
        </button>
      </div>

      {!cycle && !statusQuery.isLoading && (
        <p className="text-sm text-gray-500">No active cycle. Click "Run Cycle" to start.</p>
      )}

      {statusQuery.isLoading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-48" />
          <div className="h-2 bg-gray-200 rounded w-full" />
        </div>
      )}

      {cycle && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-2 rounded-full ${cycle.status === 'running' ? 'bg-blue-500 animate-pulse' : cycle.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              Cycle #{cycle.cycleNumber} — {cycle.status}
            </span>
            {cycle.slogan && (
              <span className="text-xs text-gray-400 ml-2">"{cycle.slogan}"</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${cycle.progress || 0}%` }}
            />
          </div>

          {/* Phase timeline */}
          <div className="grid grid-cols-6 gap-1">
            {PHASES.map((phase) => {
              const isComplete = cycle.currentPhase > phase.num || cycle.status === 'completed';
              const isCurrent = cycle.currentPhase === phase.num && cycle.status === 'running';
              return (
                <div
                  key={phase.num}
                  className={`text-center p-2 rounded text-xs ${
                    isComplete ? 'bg-green-50 text-green-700' :
                    isCurrent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' :
                    'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="text-base mb-1">{phase.icon}</div>
                  <div className="font-medium leading-tight">{phase.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {triggerMutation.isError && (
        <p className="mt-3 text-xs text-red-500">Error: {triggerMutation.error.message}</p>
      )}
    </div>
  );
}
