'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { formatTokenAmount } from '@/lib/format';
import { ValidatorTier, type ValidatorInfo } from '@notareum/sdk';
import PageHeader from '@/components/PageHeader';
import TierBadge from '@/components/TierBadge';
import { useNotareumFactory } from '@/hooks/useNotareum';

const TIER_THRESHOLDS: { tier: ValidatorTier; min: bigint; label: string; daily: string }[] = [
  { tier: ValidatorTier.BRONZE, min: 10_000n * 10n ** 18n, label: 'Bronze', daily: '100/day' },
  { tier: ValidatorTier.SILVER, min: 50_000n * 10n ** 18n, label: 'Silver', daily: '500/day' },
  { tier: ValidatorTier.GOLD, min: 250_000n * 10n ** 18n, label: 'Gold', daily: '2,500/day' },
  { tier: ValidatorTier.PLATINUM, min: 1_000_000n * 10n ** 18n, label: 'Platinum', daily: 'Unlimited' },
];

function projectTier(amount: bigint): ValidatorTier {
  let tier = ValidatorTier.NONE;
  for (const t of TIER_THRESHOLDS) {
    if (amount >= t.min) tier = t.tier;
  }
  return tier;
}

export default function StakingPage() {
  const { address } = useAccount();
  const getNtm = useNotareumFactory();

  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [info, setInfo] = useState<ValidatorInfo | null>(null);

  async function loadInfo() {
    if (!address) return;
    try {
      const ntm = await getNtm();
      if (!ntm) return;
      const v = await ntm.staking.getValidatorInfo(address);
      setInfo(v);
    } catch {
      setInfo(null);
    }
  }

  useEffect(() => {
    loadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const projectedAmount = amount ? (() => {
    try {
      return parseEther(amount);
    } catch {
      return 0n;
    }
  })() : 0n;
  const projected = projectTier(projectedAmount + (info?.stakedAmount ?? 0n));

  async function call(fn: 'stake' | 'unstake' | 'claim') {
    setMessage(null);
    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      let hash: string;
      if (fn === 'stake') {
        if (!amount || projectedAmount <= 0n) {
          setMessage({ kind: 'err', text: 'Enter a positive amount.' });
          setBusy(false);
          return;
        }
        hash = await ntm.staking.stake(projectedAmount);
        setAmount('');
      } else if (fn === 'unstake') {
        hash = await ntm.staking.unstake();
      } else {
        hash = await ntm.staking.claimStake();
      }
      setMessage({ kind: 'ok', text: `${fn}: ${hash.slice(0, 10)}…` });
      loadInfo();
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || `${fn} failed.` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Staking"
        description="Stake NOTA to operate as a validator. Higher tiers unlock more daily verifications and reward multipliers."
      />

      {/* Tier thresholds */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TIER_THRESHOLDS.map((t) => (
          <div
            key={t.tier}
            className="glass-panel p-4"
            style={{
              borderColor: info?.tier === t.tier ? 'var(--brand)' : 'var(--card-border)',
              boxShadow: info?.tier === t.tier ? '0 0 0 3px color-mix(in srgb, var(--brand) 18%, transparent)' : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier={t.tier} size="sm" />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {(Number(t.min) / 1e18).toLocaleString()}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              NOTA · {t.daily}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Current position + stake form */}
        <div className="glass-panel p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Stake NOTA</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Requires a prior NOTA token approval to the validator staking contract.
            </p>
          </div>

          <div>
            <label className="label-field" htmlFor="sa">Amount (NOTA)</label>
            <input
              id="sa"
              className="input input-mono"
              inputMode="decimal"
              placeholder="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div>
              <div className="stat-label mb-1">Projected tier</div>
              <TierBadge tier={projected} size="md" />
            </div>
            <div className="text-right">
              <div className="stat-label mb-1">After stake</div>
              <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text)' }}>
                {formatTokenAmount((info?.stakedAmount ?? 0n) + projectedAmount, { symbol: 'NOTA' })}
              </div>
            </div>
          </div>

          {message && (
            <div
              className="text-xs rounded-lg px-3 py-2.5"
              style={{
                background: message.kind === 'ok' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                color: message.kind === 'ok' ? '#059669' : '#dc2626',
              }}
            >
              {message.text}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => call('stake')}
              disabled={busy || !address}
              className="btn-primary text-sm"
              style={{ opacity: busy || !address ? 0.5 : 1 }}
            >
              {busy ? '…' : 'Stake'}
            </button>
            <button
              type="button"
              onClick={() => call('unstake')}
              disabled={busy || !address || !info || info.stakedAmount === 0n}
              className="btn-secondary text-sm"
              style={{ opacity: busy || !address || !info || info.stakedAmount === 0n ? 0.5 : 1 }}
            >
              Unstake (initiate)
            </button>
            <button
              type="button"
              onClick={() => call('claim')}
              disabled={busy || !address || !info || info.unbondingAmount === 0n}
              className="btn-secondary text-sm"
              style={{ opacity: busy || !address || !info || info.unbondingAmount === 0n ? 0.5 : 1 }}
            >
              Claim (after unbonding)
            </button>
          </div>
        </div>

        {/* Current position */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>My Position</h2>

          <div className="space-y-3">
            <Row label="Current tier" value={<TierBadge tier={info?.tier ?? ValidatorTier.NONE} size="md" />} />
            <Row label="Staked" value={<span className="font-mono text-sm font-semibold">{formatTokenAmount(info?.stakedAmount ?? 0n, { symbol: 'NOTA' })}</span>} />
            <Row
              label="Daily remaining"
              value={
                <span className="font-mono text-sm font-semibold">
                  {info?.tier === ValidatorTier.PLATINUM ? '∞' : (info?.dailyVerifications ?? 0n).toString()}
                </span>
              }
            />
            <Row label="Slash count" value={<span className="font-mono text-sm">{info?.slashCount ?? 0}</span>} />
            <Row label="Unbonding" value={<span className="font-mono text-sm">{formatTokenAmount(info?.unbondingAmount ?? 0n, { symbol: 'NOTA' })}</span>} />
            <Row label="Active" value={<span className="font-mono text-sm">{info?.isActive ? 'yes' : 'no'}</span>} />
          </div>

          <p className="text-xs pt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Unbonding period is 14 days. After unstaking you must wait before claiming.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="stat-label">{label}</div>
      <div style={{ color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
