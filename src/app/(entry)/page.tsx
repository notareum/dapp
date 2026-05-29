'use client';

import { useEffect, useState } from 'react';

import ConnectButton from '@/components/ConnectButton';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function EntryPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isConnected) {
      router.replace('/dashboard');
    }
  }, [isConnected, router]);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 15% 20%, color-mix(in srgb, var(--brand) 22%, transparent) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, color-mix(in srgb, var(--brand-soft) 18%, transparent) 0%, transparent 55%)',
        }}
      />
      <div className="absolute inset-0 pointer-events-none grid-pattern opacity-40" />

      {/* Header: logo + theme toggle */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Notareum" width={36} height={36} className="h-9 w-9" priority />
          <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--text)' }}>
            Notareum
          </span>
        </div>
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        )}
      </header>

      {/* Main two-column layout */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: brand messaging */}
            <div className="animate-fade-up order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6" style={{ background: 'var(--brand-fog)', color: 'var(--brand)', border: '1px solid color-mix(in srgb, var(--brand) 25%, transparent)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                Sepolia Testnet
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
                style={{ color: 'var(--text)', letterSpacing: '-0.035em', lineHeight: 1.02 }}
              >
                The Trust Layer
                <br />
                for Web3.
                <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Verified Resource Sharing.
                </span>
              </h1>

              <p
                className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
                style={{ color: 'var(--text-body)' }}
              >
                Connect your wallet to register resources, create .nota files, and participate in the verification network.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <div className="glass-panel p-4 flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--brand) 14%, transparent)', color: 'var(--brand)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text)' }}>
                      Cryptographic Verification
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      ECDSA signatures and on-chain attestations anchor every resource.
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-4 flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--brand) 14%, transparent)', color: 'var(--brand)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                      <polyline points="21 16 21 21 16 21" />
                      <line x1="15" y1="15" x2="21" y2="21" />
                      <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text)' }}>
                      Universal Transfer Interface
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      One .nota file format works across every chain and ecosystem.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: connect card */}
            <div className="animate-fade-up delay-200 flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="glass-panel p-8 sm:p-10 w-full max-w-md relative overflow-hidden">
                {/* Subtle corner glow */}
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand) 30%, transparent) 0%, transparent 70%)' }}
                />

                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)',
                      boxShadow: '0 10px 24px color-mix(in srgb, var(--brand) 35%, transparent)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    Connect Wallet
                  </h2>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Sign in with any EVM wallet. Your keys, your resources, your verified identity on chain.
                  </p>

                  <ConnectButton fullWidth />

                  <div
                    className="mt-6 pt-6 space-y-2.5"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    {[
                      'No passwords. Sign in with your wallet.',
                      'Self-custodial. Notareum never holds your assets.',
                      'Works with MetaMask, Rainbow, Coinbase Wallet, and more.',
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 px-6 sm:px-10 py-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>&copy; 2026 Notareum Labs</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">v1.0</span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Audited
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Open Source
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Multi-chain
          </span>
        </div>
      </footer>
    </div>
  );
}
