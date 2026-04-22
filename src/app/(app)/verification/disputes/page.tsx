'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';

interface Dispute {
  id: string;
  resourceId: string;
  complainant: string;
  status: 'open' | 'reviewing' | 'resolved_innocent' | 'resolved_guilty';
  bond: string;
  submittedAt: string;
  evidence: string;
}

const DISPUTE_STATUSES = {
  open: { label: 'Open', color: 'var(--brand)' },
  reviewing: { label: 'Under Review', color: '#f59e0b' },
  resolved_innocent: { label: 'Resolved: Innocent', color: '#10b981' },
  resolved_guilty: { label: 'Resolved: Slashed', color: '#ef4444' },
};

export default function DisputesPage() {
  const { isConnected } = useAccount();
  const [resourceId, setResourceId] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Placeholder disputes for UI demonstration
  const disputes: Dispute[] = [];

  async function handleSubmitDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!resourceId.trim() || !evidence.trim()) return;

    setSubmitting(true);
    try {
      // On-chain: submit dispute with NOTA bond
      // ntm.verification.submitDispute(resourceId, evidenceHash)
      alert('Dispute submission requires a live contract connection and NOTA bond deposit. Connect to Sepolia to submit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="Challenge a verification decision by submitting evidence and posting a NOTA bond."
      />

      {/* How disputes work */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          How Dispute Resolution Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>1</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Submit Evidence</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Provide the resource ID and evidence supporting your dispute. A NOTA bond is required to prevent frivolous claims.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>2</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Arbitration Review</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              An arbitration committee reviews metadata and chain proofs. The resource status changes to Disputed during review.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--brand)' }}>3</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Verdict</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              If malicious: validators are slashed and the resource is revoked. If frivolous: the complainant&apos;s bond is burned.
            </p>
          </div>
        </div>
      </div>

      {/* Bond info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5">
          <div className="stat-label mb-1.5">Dispute Bond</div>
          <div className="stat-value">500 NOTA</div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Required to file a dispute</p>
        </div>
        <div className="glass-panel p-5">
          <div className="stat-label mb-1.5">Success Reward</div>
          <div className="stat-value">Bond + Bonus</div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Bond returned plus slashing reward</p>
        </div>
        <div className="glass-panel p-5">
          <div className="stat-label mb-1.5">Failed Dispute</div>
          <div className="stat-value">Bond Burned</div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Frivolous disputes lose their bond</p>
        </div>
      </div>

      {/* Submit dispute form */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          File a Dispute
        </h2>
        <form onSubmit={handleSubmitDispute} className="space-y-4 max-w-xl">
          <div>
            <label className="label-field">Resource ID</label>
            <input
              type="text"
              className="input input-mono"
              placeholder="0x..."
              value={resourceId}
              onChange={e => setResourceId(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              The bytes32 resource ID of the resource you are disputing.
            </p>
          </div>
          <div>
            <label className="label-field">Evidence</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Describe the issue and provide supporting evidence (on-chain references, screenshots, etc.)"
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="rounded-lg p-3" style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)', border: '1px solid color-mix(in srgb, #f59e0b 20%, transparent)' }}>
            <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>
              Filing a dispute requires depositing a 500 NOTA bond. This bond will be returned (plus a reward) if the dispute is successful, or burned if the dispute is deemed frivolous.
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={!isConnected || submitting || !resourceId.trim() || !evidence.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Dispute (500 NOTA Bond)'}
          </button>
        </form>
      </div>

      {/* My disputes */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          My Disputes
        </h2>
        {disputes.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No disputes filed. Use the form above to dispute a verification decision.
          </p>
        ) : (
          <div className="space-y-3">
            {disputes.map(d => (
              <div key={d.id} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {d.resourceId.slice(0, 10)}...{d.resourceId.slice(-8)}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${DISPUTE_STATUSES[d.status].color} 12%, transparent)`,
                      color: DISPUTE_STATUSES[d.status].color,
                    }}
                  >
                    {DISPUTE_STATUSES[d.status].label}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-body)' }}>{d.evidence}</p>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Bond: {d.bond}</span>
                  <span>Submitted: {d.submittedAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
