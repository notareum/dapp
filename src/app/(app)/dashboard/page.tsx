'use client';

import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import TierBadge from '@/components/TierBadge';
import { ValidatorTier } from '@notareum/sdk';
import { formatTokenAmount } from '@/lib/format';
import { useNotareum } from '@/hooks/useNotareum';

function formatEthBal(value: bigint): string {
  try {
    const num = Number(value) / 1e18;
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } catch { return '0'; }
}

function truncateAddr(addr?: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatNota(n: bigint | undefined | null) {
  return formatTokenAmount(n);
}

interface DashboardStats {
  resources: number;
  staked: bigint;
  tier: ValidatorTier;
  votingPower: bigint;
  dailyRemaining: bigint;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const ntm = useNotareum();
  const balance = useBalance({ address });

  const [stats, setStats] = useState<DashboardStats>({
    resources: 0,
    staked: 0n,
    tier: ValidatorTier.NONE,
    votingPower: 0n,
    dailyRemaining: 0n,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isConnected || !address || !ntm) return;

    setLoading(true);
    (async () => {
      const next: DashboardStats = {
        resources: 0,
        staked: 0n,
        tier: ValidatorTier.NONE,
        votingPower: 0n,
        dailyRemaining: 0n,
      };
      try {
        const info = await ntm.staking.getValidatorInfo(address);
        next.staked = info.stakedAmount;
        next.tier = info.tier;
        next.dailyRemaining = info.dailyVerifications;
      } catch {
        /* contracts not deployed yet */
      }
      try {
        const vp = await ntm.governance.getVotingPower(address);
        next.votingPower = vp;
      } catch {
        /* noop */
      }
      if (!cancelled) {
        setStats(next);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, ntm]);

  return (
    <div className="space-y-8">
      {/* Decorative background blobs (absolute-positioned, contained inside <main>) */}
      <div className="relative -mt-6 sm:-mt-8 lg:-mt-10 overflow-hidden pointer-events-none hidden sm:block" aria-hidden>
        <div className="decor-blur w-[420px] h-[420px] -top-20 -left-20" style={{ background: 'color-mix(in srgb, var(--brand) 35%, transparent)' }} />
        <div className="decor-blur w-[360px] h-[360px] top-40 right-0" style={{ background: 'color-mix(in srgb, var(--brand-soft) 30%, transparent)' }} />
      </div>

      {/* Hero: identity card + summary stat card */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
        {/* Identity */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="stat-label mb-4">Wallet</div>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)',
                boxShadow: '0 8px 20px color-mix(in srgb, var(--brand) 30%, transparent)',
              }}
            >
              {address ? address.slice(2, 4).toUpperCase() : 'NX'}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold font-mono truncate" style={{ color: 'var(--text)' }}>
                {truncateAddr(address)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Connected on Sepolia
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="stat-label mb-1">ETH</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {balance.data ? formatEthBal(balance.data.value) : '\u2014'}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="stat-label mb-1">Tier</div>
              <div className="mt-1">
                <TierBadge tier={stats.tier} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Main stats */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="stat-label">Protocol activity</div>
            {loading && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                loading…
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

            <div className="min-w-0">
              <div className="stat-label mb-1.5">Resources</div>
              <div className="stat-value">{stats.resources}</div>
            </div>
            <div className="min-w-0">
              <div className="stat-label mb-1.5">Staked NOTA</div>
              <div className="stat-value">{formatNota(stats.staked)}</div>
            </div>
            <div className="min-w-0">
              <div className="stat-label mb-1.5">veNOTA</div>
              <div className="stat-value">{formatNota(stats.votingPower)}</div>
            </div>
            <div className="min-w-0">
              <div className="stat-label mb-1.5">Daily left</div>
              <div className="stat-value">
                {stats.tier === ValidatorTier.PLATINUM ? '∞' : stats.dailyRemaining.toString()}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <QuickAction
              href="/registry"
              label="Register"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            />
            <QuickAction
              href="/nota"
              label="Create .nota"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            />
            <QuickAction
              href="/staking"
              label="Stake"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="10" rx="2" />
                  <path d="M6 17v-6" />
                  <path d="M18 17V7" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Secondary section: feature cards */}
      <section className="relative">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Explore the protocol
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            href="/registry"
            title="Registry"
            description="Register and resolve blockchain resources across every chain."
            icon="registry"
          />
          <FeatureCard
            href="/nota"
            title=".nota Files"
            description="Create signed .nota files and import ones shared with you."
            icon="nota"
          />
          <FeatureCard
            href="/verification"
            title="Verification"
            description="Request verification or attest as a validator."
            icon="verify"
          />
          <FeatureCard
            href="/staking"
            title="Staking"
            description="Stake NOTA to become a validator and earn fees."
            icon="stake"
          />
          <FeatureCard
            href="/governance"
            title="Governance"
            description="Lock NOTA for veNOTA and vote on protocol upgrades."
            icon="govern"
          />
          <FeatureCard
            href="/explorer"
            title="Explorer"
            description="Search registered resources and browse protocol activity."
            icon="explore"
          />
        </div>
      </section>
    </div>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all"
      style={{
        background: 'color-mix(in srgb, var(--brand) 10%, transparent)',
        color: 'var(--brand)',
        border: '1px solid color-mix(in srgb, var(--brand) 25%, transparent)',
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function FeatureCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    registry: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" />
        <path d="M4 10h16" />
        <path d="M10 10v10" />
      </svg>
    ),
    nota: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    verify: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    stake: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 17v-6" />
        <path d="M18 17V7" />
      </svg>
    ),
    govern: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
      </svg>
    ),
    explore: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  };

  return (
    <Link href={href} className="glass-panel glass-panel-interactive p-5 block">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--brand) 12%, transparent)',
            color: 'var(--brand)',
          }}
        >
          {icons[icon]}
        </div>
        <div className="font-semibold text-base" style={{ color: 'var(--text)' }}>
          {title}
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </Link>
  );
}
