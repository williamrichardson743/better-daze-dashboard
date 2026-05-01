interface SocialPlatformCardProps {
  platform: string;
  name: string;
  icon: string;
  connected: boolean;
  accountName?: string;
  followers?: number;
  engagementRate?: number;
  onConnect: () => void;
  onDisconnect: () => void;
}
export default function SocialPlatformCard({ platform, name, icon, connected, accountName, followers, engagementRate, onConnect, onDisconnect }: SocialPlatformCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <span className={`text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>{connected ? `● ${accountName}` : '○ Not connected'}</span>
        </div>
      </div>
      {connected && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">{followers?.toLocaleString() || '0'}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-lg font-bold text-gray-800">{engagementRate || '0'}%</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
        </div>
      )}
      <button onClick={connected ? onDisconnect : onConnect} className={`w-full py-2 text-xs font-medium rounded ${connected ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
