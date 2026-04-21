'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { formatTokenAmount, formatPercent } from '@/lib/format';
import PageHeader from '@/components/PageHeader';
import { useNotareumFactory } from '@/hooks/useNotareum';

const DAY = 86400;
const MIN_DURATION = 91 * DAY;
const MAX_DURATION = 1461 * DAY;
const MAX_MULTIPLIER = 10n;

const DURATIONS = [
  { label: '3 months', seconds: 91 * DAY },
  { label: '6 months', seconds: 182 * DAY },
  { label: '1 year', seconds: 365 * DAY },
  { label: '2 years', seconds: 730 * DAY },
  { label: '4 years', seconds: 1461 * DAY },
];

function projectVeNota(amount: bigint, durationSec: number): bigint {
  if (amount <= 0n || durationSec <= 0) return 0n;
  // Linear interpolation: veNOTA = amount * (1 + (multiplier - 1) * (dur - MIN) / (MAX - MIN))
  const clamped = Math.min(Math.max(durationSec, MIN_DURATION), MAX_DURATION);
  const numerator = BigInt(clamped - MIN_DURATION);
  const denominator = BigInt(MAX_DURATION - MIN_DURATION);
  if (denominator === 0n) return amount;
  const boost = (MAX_MULTIPLIER - 1n) * numerator / denominator;
  return amount * (1n + boost);
}

export default function GovernancePage() {
  const { address } = useAccount();
  const getNtm = useNotareumFactory();

  const [amount, setAmount] = useState('');
  const [durationIdx, setDurationIdx] = useState(2);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [votingPower, setVotingPower] = useState<bigint>(0n);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);

  async function loadGov() {
    if (!address) return;
    try {
      const ntm = await getNtm();
      if (!ntm) return;
      const [vp, ts] = await Promise.all([
        ntm.governance.getVotingPower(address).catch(() => 0n),
        ntm.governance.getTotalSupply().catch(() => 0n),
      ]);
      setVotingPower(vp);
      setTotalSupply(ts);
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    loadGov();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const amountBig = amount ? (() => {
    try {
      return parseEther(amount);
    } catch {
      return 0n;
    }
  })() : 0n;
  const projected = projectVeNota(amountBig, DURATIONS[durationIdx].seconds);

  async function handleLock(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (amountBig <= 0n) {
      setMessage({ kind: 'err', text: 'Enter a positive amount.' });
      return;
    }
    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      const hash = await ntm.governance.lock(amountBig, BigInt(DURATIONS[durationIdx].seconds));
      setMessage({ kind: 'ok', text: `Locked: ${hash.slice(0, 10)}…` });
      setAmount('');
      loadGov();
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || 'Lock failed.' });
    } finally {
      setBusy(false);
    }
  }

  const [unlockId, setUnlockId] = useState('');

  async function handleUnlock() {
    setMessage(null);
    if (!unlockId) return;
    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      const hash = await ntm.governance.unlock(BigInt(unlockId));
      setMessage({ kind: 'ok', text: `Unlocked: ${hash.slice(0, 10)}…` });
      setUnlockId('');
      loadGov();
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || 'Unlock failed.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Governance"
        description="Lock NOTA to receive veNOTA voting power. Longer locks grant higher multipliers, up to 10x for a 4-year commitment."
      />

      {/* Voting power summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass-panel p-5">
          <div className="stat-label mb-2">My Voting Power</div>
          <div className="stat-value">{formatTokenAmount(votingPower)}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>veNOTA</div>
        </div>
        <div className="glass-panel p-5">
          <div className="stat-label mb-2">Total veNOTA Supply</div>
          <div className="stat-value">{formatTokenAmount(totalSupply)}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Your share: {formatPercent(votingPower, totalSupply, 4)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Lock form */}
        <form onSubmit={handleLock} className="glass-panel p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Lock NOTA</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Tokens are locked for the full duration. Unlock after expiry to reclaim principal.
            </p>
          </div>

          <div>
            <label className="label-field" htmlFor="la">Amount (NOTA)</label>
            <input
              id="la"
              className="input input-mono"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field">Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDurationIdx(i)}
                  className="px-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: durationIdx === i ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : 'var(--bg)',
                    color: durationIdx === i ? 'var(--brand)' : 'var(--text-muted)',
                    border: `1px solid ${durationIdx === i ? 'var(--brand)' : 'var(--border)'}`,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div>
              <div className="stat-label mb-1">Projected veNOTA</div>
              <div className="text-lg font-bold font-mono" style={{ color: 'var(--brand)' }}>
                {formatTokenAmount(projected)}
              </div>
            </div>
            <div className="text-right">
              <div className="stat-label mb-1">Multiplier</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {amountBig > 0n ? (Number(projected) / Number(amountBig)).toFixed(2) : '0.00'}x
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

          <button
            type="submit"
            disabled={busy || !address}
            className="btn-primary text-sm"
            style={{ opacity: busy || !address ? 0.5 : 1 }}
          >
            {busy ? '…' : 'Lock NOTA'}
          </button>
        </form>

        {/* Unlock */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>My Locks</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Enter a lock ID to unlock after its expiry.
            </p>
          </div>

          <div>
            <label className="label-field" htmlFor="lid">Lock ID</label>
            <input
              id="lid"
              className="input input-mono"
              placeholder="0"
              value={unlockId}
              onChange={(e) => setUnlockId(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleUnlock}
            disabled={busy || !address || !unlockId}
            className="btn-secondary text-sm w-full"
            style={{ opacity: busy || !address || !unlockId ? 0.5 : 1 }}
          >
            {busy ? '…' : 'Unlock'}
          </button>

          <div
            className="text-xs rounded-lg p-5 text-center"
            style={{ background: 'var(--bg)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
          >
            Active locks are indexed on-chain. Enumeration will be available in a later release.
          </div>
        </div>
      </div>
    </div>
  );
}
