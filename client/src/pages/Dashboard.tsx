import { trpc } from '../lib/trpc';
import MetricsCard from '../components/MetricsCard';
import CycleMonitor from '../components/CycleMonitor';

export default function Dashboard() {
  const metricsQuery = trpc.dashboard.metrics.useQuery(undefined, { refetchInterval: 10000 });
  const ordersQuery = trpc.dashboard.recentOrders.useQuery({ limit: 5 });
  const m = metricsQuery.data;
  const loading = metricsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricsCard label="Revenue" value={m ? `$${m.revenue?.toFixed(2) || '0'}` : '$—'} icon="💰" loading={loading} delta={12} positive />
        <MetricsCard label="Units Sold" value={m?.units || '—'} icon="📦" loading={loading} delta={8} positive />
        <MetricsCard label="Active Drops" value={m?.activeDrops || '—'} icon="🎯" loading={loading} />
        <MetricsCard label="TikTok Views" value={m?.tiktokViews?.toLocaleString() || '—'} icon="📱" loading={loading} delta={24} positive />
        <MetricsCard label="IG Reach" value={m?.instagramReach?.toLocaleString() || '—'} icon="📸" loading={loading} />
        <MetricsCard label="Cycles Run" value={m?.cyclesRun || '—'} icon="🔄" loading={loading} />
      </div>

      {/* Cycle Monitor */}
      <CycleMonitor />

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Recent Orders</h3>
        {ordersQuery.isLoading && <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}</div>}
        {ordersQuery.data && ordersQuery.data.length > 0 ? (
          <div className="space-y-2">
            {ordersQuery.data.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-800">#{order.shopifyOrderId || order.id}</span>
                  <span className="text-xs text-gray-500 ml-2">{order.customerEmail || 'Unknown'}</span>
                </div>
                <div className="text-sm font-semibold text-green-600">${order.revenue || '0.00'}</div>
              </div>
            ))}
          </div>
        ) : ordersQuery.isSuccess ? (
          <p className="text-sm text-gray-500">No orders yet. Run a cycle to start generating revenue.</p>
        ) : null}
      </div>

      {metricsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          Unable to load dashboard data. Check your connection and API keys in Settings.
        </div>
      )}
    </div>
  );
}
