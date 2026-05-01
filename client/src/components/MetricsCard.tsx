interface MetricsCardProps {
  label: string;
  value: string | number;
  delta?: number;
  positive?: boolean;
  loading?: boolean;
  icon?: string;
}

export default function MetricsCard({ label, value, delta, positive, loading, icon }: MetricsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {delta !== undefined && (
        <div className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? '↑' : '↓'} {Math.abs(delta)}% vs last week
        </div>
      )}
    </div>
  );
}
