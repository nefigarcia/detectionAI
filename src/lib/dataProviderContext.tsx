'use client';

import React from 'react';
import { MockProvider, ApiProvider, DashboardDataProvider } from './dataProviders';

const DataProviderContext = React.createContext<DashboardDataProvider | null>(null);

export function useDataProvider() {
  const ctx = React.useContext(DataProviderContext);
  if (!ctx) throw new Error('useDataProvider must be used within DataProviderProvider');
  return ctx;
}

export function DataProviderProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = React.useState<DashboardDataProvider>(MockProvider);

  React.useEffect(() => {
  // Demo mode support: if user clicked the demo tenant, we honor demoMode flag
  const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('demoMode') : null;
  // Also support explicit ?demo=1 query param to avoid localStorage timing issues
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const demoQuery = urlParams?.get('demo');
    const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
    if (storedDemo || demoQuery === '1') {
      setProvider(MockProvider);
    } else if (storedAuth) {
      setProvider(ApiProvider);
    } else {
      setProvider(MockProvider);
    }

    // Listen for cross-tab changes to demoMode or authUser
    function onStorage(e: StorageEvent) {
      if (e.key === 'authUser') {
        if (e.newValue) {
          // if user signs in, clear demo mode and switch to API provider
          try {
            localStorage.removeItem('demoMode');
          } catch (err) {
            // ignore
          }
          setProvider(ApiProvider);
        } else {
          setProvider(MockProvider);
        }
      } else if (e.key === 'demoMode') {
        if (e.newValue) setProvider(MockProvider);
        else {
          const auth = localStorage.getItem('authUser');
          if (auth) setProvider(ApiProvider);
          else setProvider(MockProvider);
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>;
}
