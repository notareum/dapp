'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { keccak256, toHex } from 'viem';
import PageHeader from '@/components/PageHeader';
import ResourceCard from '@/components/ResourceCard';
import { useNotareumFactory } from '@/hooks/useNotareum';

const RESOURCE_TYPES = [
  { value: 0, label: 'Address' },
  { value: 1, label: 'Transaction' },
  { value: 2, label: 'Contract' },
  { value: 3, label: 'IPFS' },
  { value: 4, label: 'NFT' },
  { value: 5, label: 'Metadata' },
];

const CHAINS = [
  { value: 1, label: 'Ethereum Mainnet' },
  { value: 11155111, label: 'Sepolia' },
  { value: 137, label: 'Polygon' },
  { value: 10, label: 'Optimism' },
  { value: 42161, label: 'Arbitrum' },
  { value: 8453, label: 'Base' },
  { value: 0, label: 'Non-EVM' },
];

interface LocalResource {
  resourceId: string;
  resourceType: number;
  chainId: number;
  identifier: string;
  alias: string;
  verificationStatus: number;
  owner?: string;
}

export default function RegistryPage() {
  const { address } = useAccount();
  const getNtm = useNotareumFactory();

  const [resourceType, setResourceType] = useState(0);
  const [chainId, setChainId] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [alias, setAlias] = useState('');
  const [proofHash, setProofHash] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<LocalResource | null>(null);
  const [searching, setSearching] = useState(false);

  const [myResources] = useState<LocalResource[]>([]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!identifier) {
      setMessage({ kind: 'err', text: 'Identifier is required.' });
      return;
    }
    setBusy(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      const ph = proofHash && proofHash.startsWith('0x') && proofHash.length === 66
        ? proofHash
        : keccak256(toHex(identifier));
      const hash = await ntm.registry.registerResource(resourceType, BigInt(chainId), identifier, ph, alias);
      setMessage({ kind: 'ok', text: `Registration submitted: ${hash.slice(0, 10)}…` });
      setIdentifier('');
      setAlias('');
      setProofHash('');
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || 'Registration failed.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchResult(null);
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const ntm = await getNtm();
      if (!ntm) throw new Error('SDK not ready');
      let resourceId = searchQuery.trim();
      if (!resourceId.startsWith('0x') || resourceId.length !== 66) {
        resourceId = await ntm.registry.resolveAlias(searchQuery.trim());
      }
      const r = await ntm.registry.getResource(resourceId);
      setSearchResult({
        resourceId,
        resourceType: r.resourceType,
        chainId: Number(r.chainId),
        identifier: r.identifier,
        alias: r.alias,
        verificationStatus: r.verificationStatus,
        owner: r.owner,
      });
    } catch (err) {
      setMessage({ kind: 'err', text: `Not found: ${(err as Error).message}` });
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Registry"
        description="Register blockchain resources and resolve them by ID or alias. Every registration anchors a resource to the on-chain Notareum Registry."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Register form */}
        <form onSubmit={handleRegister} className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Register Resource
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Submit a new resource to the registry.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="rt">Type</label>
              <select
                id="rt"
                className="input"
                value={resourceType}
                onChange={(e) => setResourceType(Number(e.target.value))}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field" htmlFor="ch">Chain</label>
              <select
                id="ch"
                className="input"
                value={chainId}
                onChange={(e) => setChainId(Number(e.target.value))}
              >
                {CHAINS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="id">Identifier</label>
            <input
              id="id"
              className="input input-mono"
              placeholder="0x... or CID or tx hash"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field" htmlFor="al">Alias (optional)</label>
            <input
              id="al"
              className="input"
              placeholder="alice.nota"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field" htmlFor="ph">Proof hash (optional)</label>
            <input
              id="ph"
              className="input input-mono"
              placeholder="0x... (32-byte hex, computed from identifier if blank)"
              value={proofHash}
              onChange={(e) => setProofHash(e.target.value)}
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
            {busy ? 'Submitting…' : address ? 'Register resource' : 'Connect wallet'}
          </button>
        </form>

        {/* Search */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              Resolve
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Look up a resource by ID (bytes32) or alias.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              className="input input-mono flex-1"
              placeholder="0x... or alice.nota"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-secondary text-sm" disabled={searching}>
              {searching ? 'Searching' : 'Search'}
            </button>
          </form>

          {searchResult && (
            <ResourceCard
              resourceId={searchResult.resourceId}
              resourceType={searchResult.resourceType}
              chainId={searchResult.chainId}
              identifier={searchResult.identifier}
              alias={searchResult.alias}
              verificationStatus={searchResult.verificationStatus}
              owner={searchResult.owner}
            />
          )}

          {!searchResult && (
            <div
              className="text-xs rounded-lg p-6 text-center"
              style={{ background: 'var(--bg)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            >
              Enter a resource ID or alias to fetch its record.
            </div>
          )}
        </div>
      </div>

      {/* My resources */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
          My Resources
        </h2>
        {myResources.length === 0 ? (
          <div
            className="glass-panel p-10 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <div className="text-sm">
              You have not registered any resources yet. On-chain indexing is required to list them; register your first one using the form above.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myResources.map((r) => (
              <ResourceCard key={r.resourceId} {...r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
