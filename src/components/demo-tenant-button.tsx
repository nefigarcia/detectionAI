"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React from 'react';

export default function DemoTenantButton() {
  const router = useRouter();

  const handleClick = React.useCallback(() => {
    try {
      localStorage.setItem('demoMode', '1');
      localStorage.removeItem('authUser');
    } catch (e) {
      // ignore
    }
    // Include a query param to make demo intent explicit and avoid timing issues
    router.push('/dashboard?demo=1');
  }, [router]);

  return <Button onClick={handleClick}>Demo Tenant</Button>;
}
