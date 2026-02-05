"use client";

import React from 'react';

export default function DemoBadge() {
  const [isDemo, setIsDemo] = React.useState(false);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const demoQuery = params.get('demo');
      const demoStored = localStorage.getItem('demoMode');
      if (demoQuery === '1' || demoStored) setIsDemo(true);
    } catch (e) {
      // ignore
    }
  }, []);

  if (!isDemo) return null;

  return (
    <div className="ml-4 hidden items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 sm:flex">
      Demo mode
    </div>
  );
}
