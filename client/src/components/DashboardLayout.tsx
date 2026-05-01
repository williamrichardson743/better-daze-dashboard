import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trpc } from '../lib/trpc';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/social', label: 'Social', icon: '📱' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const healthQuery = trpc.system.health.useQuery(undefined, {
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-yellow-400 tracking-wide">BETTER DAZE</h1>
              <p className="text-xs text-gray-400 tracking-wider">OFFICIAL NARRATIVE DIVISION</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-400 border-r-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                healthQuery.isSuccess ? 'bg-green-400' : healthQuery.isError ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
              }`}
            />
            {sidebarOpen && (
              <span className="text-xs text-gray-400">
                {healthQuery.isSuccess ? 'System Online' : healthQuery.isError ? 'Offline' : 'Connecting...'}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 font-mono">
              v2.0.0
            </span>
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
              W
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
