'use client';

import { useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import PageHeader from '@/components/PageHeader';
import { useEthersSigner } from '@/hooks/useNotareum';
import { NotaFileClient, type CreateNotaOptions } from '@notareum/sdk';

const RESOURCE_TYPES = ['address', 'transaction', 'contract', 'ipfs', 'nft', 'metadata'];

const CHAINS = [
  { chainId: 1, chainName: 'ethereum', label: 'Ethereum Mainnet' },
  { chainId: 11155111, chainName: 'sepolia', label: 'Sepolia' },
  { chainId: 137, chainName: 'polygon', label: 'Polygon' },
  { chainId: 10, chainName: 'optimism', label: 'Optimism' },
  { chainId: 42161, chainName: 'arbitrum', label: 'Arbitrum' },
  { chainId: 8453, chainName: 'base', label: 'Base' },
];

export default function NotaPage() {
  const { address } = useAccount();
  const signerProvider = useEthersSigner();
  const nota = new NotaFileClient();

  const [type, setType] = useState('address');
  const [chainIdx, setChainIdx] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [createdJson, setCreatedJson] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [imported, setImported] = useState<{ raw: string; valid: boolean; parsed: unknown } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCreatedJson(null);
    if (!identifier) {
      setMessage({ kind: 'err', text: 'Identifier is required.' });
      return;
    }
    if (!signerProvider) {
      setMessage({ kind: 'err', text: 'Wallet not connected.' });
      return;
    }
    setBusy(true);
    try {
      const chain = CHAINS[chainIdx];
      const opts: CreateNotaOptions = {
        type,
        chainId: chain.chainId,
        chainName: chain.chainName,
        identifier,
        name: name || undefined,
        alias: alias || undefined,
        description: description || undefined,
      };
      const signer = await signerProvider.getSigner();
      const builder = nota.create(opts);
      const signed = await builder.sign(signer);
      signed.validate();
      setCreatedJson(signed.serialize());
      setMessage({ kind: 'ok', text: 'Signed .nota file created. Review and download below.' });
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message || 'Failed to sign .nota file.' });
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!createdJson) return;
    const blob = new Blob([createdJson], { type: 'application/vnd.notareum.nota+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${alias || identifier.slice(0, 12) || 'resource'}.nota`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const raw = await file.text();
    try {
      const parsed = nota.parse(raw);
      const valid = nota.isValid(parsed);
      setImported({ raw, parsed, valid });
    } catch (err) {
      setImported({ raw, parsed: { error: (err as Error).message }, valid: false });
    }
  }

  return (
    <div>
      <PageHeader
        title=".nota Files"
        description="Create, sign, and verify portable .nota files. A .nota file captures a resource reference plus a cryptographic signature that anyone can verify."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create */}
        <form onSubmit={handleCreate} className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Create .nota</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Build and sign a .nota file with your connected wallet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="nt">Type</label>
              <select id="nt" className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field" htmlFor="nc">Chain</label>
              <select id="nc" className="input" value={chainIdx} onChange={(e) => setChainIdx(Number(e.target.value))}>
                {CHAINS.map((c, i) => (
                  <option key={c.chainId} value={i}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="ni">Identifier</label>
            <input id="ni" className="input input-mono" placeholder="0x... or CID" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="nn">Name (optional)</label>
              <input id="nn" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label-field" htmlFor="na">Alias (optional)</label>
              <input id="na" className="input" value={alias} onChange={(e) => setAlias(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="nd">Description (optional)</label>
            <textarea
              id="nd"
              className="input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !address}
              className="btn-primary text-sm"
              style={{ opacity: busy || !address ? 0.5 : 1, cursor: busy || !address ? 'not-allowed' : 'pointer' }}
            >
              {busy ? 'Signing…' : 'Sign .nota'}
            </button>
            {createdJson && (
              <button type="button" className="btn-secondary text-sm" onClick={handleDownload}>
                Download
              </button>
            )}
          </div>

          {createdJson && (
            <pre className="text-xs max-h-64 overflow-auto">{createdJson}</pre>
          )}
        </form>

        {/* Import / verify */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Import &amp; Verify</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Upload a .nota file to inspect its contents and validate its signature.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".nota,application/json,application/vnd.notareum.nota+json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              type="button"
              className="btn-secondary btn-secondary-fill-hover text-sm w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload .nota file
            </button>
          </div>

          {imported && (
            <div className="space-y-3">
              <div
                className="rounded-lg px-3 py-2 text-xs flex items-center gap-2"
                style={{
                  background: imported.valid ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                  color: imported.valid ? '#059669' : '#dc2626',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: 'currentColor' }} />
                {imported.valid ? 'Valid .nota file' : 'Invalid .nota file'}
              </div>
              <pre className="text-xs max-h-64 overflow-auto">
                {JSON.stringify(imported.parsed, null, 2)}
              </pre>
            </div>
          )}

          {!imported && (
            <div
              className="text-xs rounded-lg p-6 text-center"
              style={{ background: 'var(--bg)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
            >
              No file selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
