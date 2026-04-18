import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Test API connection
    fetch('/api/trpc/system.health?batch=1')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setStatus('connected');
      })
      .catch(err => {
        console.error('API Error:', err);
        setStatus('error');
      });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Better Daze Dashboard</h1>
        <p>Autonomous Content Creation & Distribution Platform</p>
      </header>

      <main className="main">
        <div className="status-card">
          <h2>System Status</h2>
          {status === 'loading' && <p className="status-loading">Connecting to backend...</p>}
          {status === 'connected' && <p className="status-ok">✓ Backend connected</p>}
          {status === 'error' && <p className="status-error">✗ Backend connection failed</p>}
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
          <h2>Get Started</h2>
          <button className="cta-button">Launch Dashboard</button>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Better Daze. All rights reserved.</p>
      </footer>
    </div>
  );
}
