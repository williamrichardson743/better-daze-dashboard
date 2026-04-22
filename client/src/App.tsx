import { useState } from 'react';
import { trpc } from './lib/trpc';
import './App.css';

export default function App() {
  const [cycleTriggered, setCycleTriggered] = useState(false);

  // Test health check
  const healthQuery = trpc.system.health.useQuery();

  // Trigger cycle mutation
  const triggerCycleMutation = trpc.cycle.trigger.useMutation({
    onSuccess: (data) => {
      console.log('Cycle triggered:', data);
      setCycleTriggered(true);
    },
    onError: (error) => {
      console.error('Error triggering cycle:', error);
    },
  });

  const handleTriggerCycle = () => {
    triggerCycleMutation.mutate({
      trendKeyword: 'AI automation',
      designPrompt: 'Modern tech aesthetic',
      productType: 'shirt',
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Better Daze Dashboard</h1>
        <p>Autonomous Content Creation & Distribution Platform</p>
      </header>

      <main className="main">
        <div className="status-card">
          <h2>System Status</h2>
          {healthQuery.isLoading && <p className="status-loading">Connecting to backend...</p>}
          {healthQuery.isSuccess && <p className="status-ok">✓ Backend connected</p>}
          {healthQuery.isError && <p className="status-error">✗ Backend connection failed</p>}
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>📊 Analytics</h3>
            <p>Real-time engagement tracking across all platforms</p>
          </div>
          <div className="feature-card">
            <h3>🎨 Design Generation</h3>
            <p>AI-powered design creation with DALL-E 3</p>
          </div>
          <div className="feature-card">
            <h3>📱 Social Integration</h3>
            <p>TikTok, Instagram, and YouTube automation</p>
          </div>
          <div className="feature-card">
            <h3>💰 Revenue Tracking</h3>
            <p>ROI calculation and revenue optimization</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Start Cycle</h2>
          <button 
            className="cta-button"
            onClick={handleTriggerCycle}
            disabled={triggerCycleMutation.isPending}
          >
            {triggerCycleMutation.isPending ? 'Starting...' : 'Launch Cycle'}
          </button>
          {cycleTriggered && <p className="success-message">✓ Cycle started successfully!</p>}
          {triggerCycleMutation.isError && (
            <p className="error-message">✗ Error: {triggerCycleMutation.error?.message}</p>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Better Daze. All rights reserved.</p>
      </footer>
    </div>
  );
}
