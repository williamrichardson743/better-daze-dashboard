import { trpc } from '../lib/trpc';
import MetricsCard from '../components/MetricsCard';

export default function Analytics() {
  const analyticsQuery = trpc.analytics.summary.useQuery(undefined, { refetchInterval: 30000 });
  const platformQuery = trpc.analytics.byPlatform.useQuery();
  const summary = analyticsQuery.data;
  const platforms = platformQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricsCard label="Total Revenue" value={summary ? `$${summary.totalRevenue?.toFixed(2) || '0'}` : '$—'} loading={analyticsQuery.isLoading} icon="💰" />
        <MetricsCard label="Total Orders" value={summary?.totalOrders || '—'} loading={analyticsQuery.isLoading} icon="📦" />
        <MetricsCard label="Avg Order Value" value={summary ? `$${summary.avgOrderValue?.toFixed(2) || '0'}` : '$—'} loading={analyticsQuery.isLoading} icon="📊" />
        <MetricsCard label="Total Cycles" value={summary?.totalCycles || '—'} loading={analyticsQuery.isLoading} icon="🔄" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Revenue by Platform</h3>
          {platforms ? (
            <div className="space-y-3">
              {Object.entries(platforms).map(([platform, data]: [string, any]) => (
                <div key={platform} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-24 capitalize">{platform}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${Math.min(100, (data?.revenue || 0) / 10)}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-20 text-right">${data?.revenue?.toFixed(2) || '0'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Run cycles to see platform analytics.</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Conversion Rate</span><span className="font-semibold">{summary?.conversionRate || '0'}%</span></div>
              <div className="bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${summary?.conversionRate || 0}%` }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">ROI</span><span className="font-semibold">{summary?.roi || '0'}%</span></div>
              <div className="bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, summary?.roi || 0)}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      {analyticsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          Unable to load analytics. Check your connection.
        </div>
      )}
    </div>
  );
}
