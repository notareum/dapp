'use client';

import PageHeader from '@/components/PageHeader';
import ResourceCard from '@/components/ResourceCard';
import { useNotareumFactory } from '@/hooks/useNotareum';
import { useState } from 'react';

interface FoundResource {
  resourceId: string;
  resourceType: number;
  chainId: number;
  identifier: string;
  alias: string;
  verificationStatus: number;
  owner: string;
}

export default function ExplorerPage() {
  const getNtm = useNotareumFactory();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FoundResource | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setResult(null);
    const q = query.trim();
    if (!q) return;

    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      let resourceId = q;
      if (!resourceId.startsWith('0x') || resourceId.length !== 66) {
        resourceId = await ntm.registry.resolveAlias(q);
      }
      const r = await ntm.registry.getResource(resourceId);
      setResult({
        resourceId,
        resourceType: r.resourceType,
        chainId: Number(r.chainId),
        identifier: r.identifier,
        alias: r.alias,
        verificationStatus: r.verificationStatus,
        owner: r.owner,
      });
    } catch (e) {
      setErr((e as Error).message || 'Not found.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Explorer"
        description="Search the Notareum Registry. Look up a resource by its 32-byte ID, its alias, or browse protocol activity."
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="glass-panel p-4 sm:p-5 flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center flex-1 min-w-0 gap-2 px-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="flex-1 bg-transparent outline-none text-sm font-mono py-2.5"
            style={{ color: 'var(--text)' }}
            placeholder="Search by resource ID or alias"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary text-sm w-full sm:w-auto" disabled={busy}>
          {busy ? '…' : 'Search'}
        </button>
      </form>

      {err && (
        <div
          className="text-xs rounded-lg px-3 py-2.5 mb-6"
          style={{ background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }}
        >
          {err}
        </div>
      )}

      {result && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Result</h2>
          <ResourceCard {...result} />
        </div>
      )}

      {/* Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Protocol Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Registrations" value="—" hint="Indexer pending" />
          <StatCard label="Verified" value="—" hint="Indexer pending" />
          <StatCard label="Pending" value="—" hint="Indexer pending" />
          <StatCard label="Validators" value="—" hint="Indexer pending" />
        </div>
      </section>

      {/* Recent feed placeholder */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Activity</h2>
        <div className="glass-panel p-10 text-center" style={{ color: 'var(--text-muted)' }}>
          <div className="text-sm">
            Event stream will stream here once the indexer is live. For now, use search to resolve individual resources.
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass-panel p-5">
      <div className="stat-label mb-2">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{hint}</div>}
    </div>
  );
}
