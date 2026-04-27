'use client';

import Sidebar from '@/components/Sidebar';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isConnected, isConnecting, isReconnecting } = useAccount();

  useEffect(() => {
    // If not connected and not mid-connect, send back to entry.
    if (!isConnected && !isConnecting && !isReconnecting) {
      router.replace('/');
    }
  }, [isConnected, isConnecting, isReconnecting, router]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
