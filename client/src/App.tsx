import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Social = lazy(() => import('./pages/Social'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const BACKEND_URL =
  typeof window !== 'undefined'
    ? '/api/trpc'
    : 'http://web.railway.internal:3000/api/trpc';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: BACKEND_URL,
          fetch(input, init) {
            return fetch(input, {
              ...(init ?? {}),
              credentials: 'include',
            });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DashboardLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/social" element={<Social />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </DashboardLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
