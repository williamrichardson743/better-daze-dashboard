import { useState } from 'react';
import { trpc } from '../lib/trpc';

export default function Settings() {
  const configQuery = trpc.config.loadApiKeys.useQuery();
  const schedulerQuery = trpc.config.getScheduler.useQuery();
  const schedulerMutation = trpc.config.scheduler.useMutation();

  const [schedulerEnabled, setSchedulerEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);

  const config = configQuery.data;

  const handleSchedulerUpdate = () => {
    schedulerMutation.mutate({
      enabled: schedulerEnabled,
      intervalHours,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* API Key Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">API Configuration</h3>
        {configQuery.isLoading ? (
          <div className="animate-pulse space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}</div>
        ) : config ? (
          <div className="space-y-3">
            {[
              { key: 'openaiConfigured', label: 'OpenAI (GPT-4o + DALL-E 3)' },
              { key: 'printifyConfigured', label: 'Printify' },
              { key: 'shopifyConfigured', label: 'Shopify' },
              { key: 'elevenLabsConfigured', label: 'ElevenLabs' },
              { key: 'ayrshareConfigured', label: 'Ayrshare (Social Distribution)' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${(config as any)[item.key] ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {(config as any)[item.key] ? '✓ Configured' : '✗ Missing'}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-xs text-gray-500 mt-4">API keys are set via Railway environment variables. Go to your Railway dashboard to update them.</p>
      </div>

      {/* Scheduler */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Cycle Scheduler</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Enable Auto-Cycle</label>
            <button
              onClick={() => setSchedulerEnabled(!schedulerEnabled)}
              className={`w-10 h-5 rounded-full relative transition-colors ${schedulerEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${schedulerEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Interval (hours)</label>
            <select
              value={intervalHours}
              onChange={(e) => setIntervalHours(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Daily</option>
              <option value={48}>Every 2 days</option>
              <option value={168}>Weekly</option>
            </select>
          </div>
          <button
            onClick={handleSchedulerUpdate}
            disabled={schedulerMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {schedulerMutation.isPending ? 'Saving...' : 'Save Scheduler Settings'}
          </button>
          {schedulerMutation.isSuccess && <p className="text-xs text-green-600">Scheduler updated.</p>}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">System Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-mono">2.0.0</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Runtime</span><span className="font-mono">Node.js + Express</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Database</span><span className="font-mono">TiDB Serverless</span></div>
          <div className="flex justify-between"><span className="text-gray-500">API</span><span className="font-mono">tRPC 11</span></div>
        </div>
      </div>
    </div>
  );
}
