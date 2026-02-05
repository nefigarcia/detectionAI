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
    // Simple auth detection: app sets localStorage 'authUser' on sign-in/signup
    const stored = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
    if (stored) {
      setProvider(ApiProvider);
    } else {
      setProvider(MockProvider);
    }

    // Listen for cross-tab auth events
    function onStorage(e: StorageEvent) {
      if (e.key === 'authUser') {
        if (e.newValue) setProvider(ApiProvider);
        else setProvider(MockProvider);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>;
}
