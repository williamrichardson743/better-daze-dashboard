import { trpc } from '../lib/trpc';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-600' },
];

export default function Social() {
  const accountsQuery = trpc.social.accounts.useQuery(undefined, { refetchInterval: 30000 });
  const postsQuery = trpc.social.posts.useQuery({ limit: 20 });
  const accounts = accountsQuery.data || [];
  const posts = postsQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const account = accounts.find((a: any) => a.platform === platform.id);
          const connected = account?.isConnected;
          return (
            <div key={platform.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{platform.name}</h3>
                  <span className={`text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                    {connected ? '● Connected' : '○ Not connected'}
                  </span>
                </div>
              </div>
              {connected && account && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Account</span><span className="font-medium">{account.accountName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Posts</span><span className="font-medium">{posts.filter((p: any) => p.platform === platform.id).length}</span></div>
                </div>
              )}
              <button className={`w-full py-2 text-xs font-medium rounded ${connected ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Recent Posts</h3>
        {postsQuery.isLoading && <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded" />)}</div>}
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post: any) => (
              <div key={post.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{PLATFORMS.find(p => p.id === post.platform)?.icon || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{post.content || 'No caption'}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-gray-500">Views: {post.metrics?.views || 0}</span>
                    <span className="text-xs text-gray-500">Engagement: {post.metrics?.engagement || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : postsQuery.isSuccess ? (
          <p className="text-sm text-gray-500">No posts yet. Connect your social accounts and run a cycle.</p>
        ) : null}
      </div>
    </div>
  );
}
