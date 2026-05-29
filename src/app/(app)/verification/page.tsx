'use client';

import PageHeader from '@/components/PageHeader';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useNotareumFactory } from '@/hooks/useNotareum';
import { useState } from 'react';

const LEVELS = [
  { value: 0, label: 'Basic', fee: 100n * 10n ** 18n, description: 'Quick community check via 3 attestations.' },
  { value: 1, label: 'Enhanced', fee: 500n * 10n ** 18n, description: 'Higher assurance requiring 7 attestations and 75% approval.' },
  { value: 2, label: 'Institutional', fee: 2000n * 10n ** 18n, description: 'Enterprise-grade verification with 15 attestations.' },
];

interface PendingRequest {
  id: string;
  resourceId: string;
  level: number;
  status: string;
}

export default function VerificationPage() {
  const { address } = useAccount();
  const getNtm = useNotareumFactory();

  const [resourceId, setResourceId] = useState('');
  const [level, setLevel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [attestResourceId, setAttestResourceId] = useState('');
  const [attestBusy, setAttestBusy] = useState(false);
  const [attestMsg, setAttestMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [myRequests] = useState<PendingRequest[]>([]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!resourceId.startsWith('0x') || resourceId.length !== 66) {
      setMessage({ kind: 'err', text: 'Resource ID must be a 32-byte hex string.' });
      return;
    }
    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      const hash = await ntm.verification.requestVerification(resourceId, level);
      setMessage({ kind: 'ok', text: `Request submitted: ${hash.slice(0, 10)}…` });
      setResourceId('');
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || 'Request failed.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleAttest(approved: boolean) {
    setAttestMsg(null);
    if (!attestResourceId.startsWith('0x') || attestResourceId.length !== 66) {
      setAttestMsg({ kind: 'err', text: 'Resource ID must be a 32-byte hex string.' });
      return;
    }
    setAttestBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      const hash = await ntm.verification.submitAttestation(attestResourceId, approved);
      setAttestMsg({ kind: 'ok', text: `${approved ? 'Approved' : 'Rejected'}: ${hash.slice(0, 10)}…` });
      setAttestResourceId('');
    } catch (err) {
      setAttestMsg({ kind: 'err', text: (err as Error).message || 'Attestation failed.' });
    } finally {
      setAttestBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Verification"
        description="Request on-chain verification for a resource, or submit attestations as a staked validator."
      />

      {/* Level selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setLevel(l.value)}
            className="glass-panel p-5 text-left transition-all"
            style={{
              borderColor: level === l.value ? 'var(--brand)' : 'var(--card-border)',
              boxShadow: level === l.value ? '0 0 0 3px color-mix(in srgb, var(--brand) 18%, transparent)' : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-base" style={{ color: 'var(--text)' }}>{l.label}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--brand)' }}>
                {formatEther(l.fee)} NOTA
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {l.description}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Request */}
        <form onSubmit={handleRequest} className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Request Verification</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Selected level: <span className="font-semibold" style={{ color: 'var(--brand)' }}>{LEVELS[level].label}</span>. Fee:{' '}
              <span className="font-mono">{formatEther(LEVELS[level].fee)} NOTA</span>.
            </p>
          </div>

          <div>
            <label className="label-field" htmlFor="vri">Resource ID</label>
            <input
              id="vri"
              className="input input-mono"
              placeholder="0x...32 bytes"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            />
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
            style={{ opacity: busy || !address ? 0.5 : 1, cursor: busy || !address ? 'not-allowed' : 'pointer' }}
          >
            {busy ? 'Submitting…' : 'Submit request'}
          </button>
        </form>

        {/* Attest */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Attest (Validators)</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Active validators can approve or reject a pending verification request.
            </p>
          </div>

          <div>
            <label className="label-field" htmlFor="ari">Resource ID</label>
            <input
              id="ari"
              className="input input-mono"
              placeholder="0x...32 bytes"
              value={attestResourceId}
              onChange={(e) => setAttestResourceId(e.target.value)}
            />
          </div>

          {attestMsg && (
            <div
              className="text-xs rounded-lg px-3 py-2.5"
              style={{
                background: attestMsg.kind === 'ok' ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                color: attestMsg.kind === 'ok' ? '#059669' : '#dc2626',
              }}
            >
              {attestMsg.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAttest(true)}
              disabled={attestBusy || !address}
              className="btn-primary text-sm flex-1"
              style={{ opacity: attestBusy || !address ? 0.5 : 1 }}
            >
              {attestBusy ? '…' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => handleAttest(false)}
              disabled={attestBusy || !address}
              className="btn-secondary text-sm flex-1"
              style={{ opacity: attestBusy || !address ? 0.5 : 1 }}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* My requests */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          My Verification Requests
        </h2>
        {myRequests.length === 0 ? (
          <div className="glass-panel p-10 text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="text-sm">
              No requests to show. On-chain indexing is required to list your submitted requests.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {myRequests.map((r) => (
              <div key={r.id} className="glass-panel p-4 flex items-center justify-between">
                <div className="font-mono text-sm truncate">{r.resourceId}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
