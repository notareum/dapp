'use client';

import StatusBadge from './StatusBadge';

const TYPE_ICON: Record<number, string> = {
  0: '👤', // ADDRESS
  1: '📜', // TRANSACTION
  2: '📦', // CONTRACT
  3: '🧬', // IPFS
  4: '🎨', // NFT
  5: '🗂️', // METADATA
};

const TYPE_LABEL: Record<number, string> = {
  0: 'Address',
  1: 'Transaction',
  2: 'Contract',
  3: 'IPFS',
  4: 'NFT',
  5: 'Metadata',
};

const CHAIN_LABEL: Record<string, string> = {
  '1': 'Ethereum',
  '137': 'Polygon',
  '10': 'Optimism',
  '42161': 'Arbitrum',
  '8453': 'Base',
  '11155111': 'Sepolia',
};

interface ResourceCardProps {
  resourceId: string;
  resourceType: number;
  chainId: bigint | number;
  identifier: string;
  alias?: string;
  verificationStatus: number;
  owner?: string;
  onClick?: () => void;
}

function truncate(s: string, head = 10, tail = 6) {
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export default function ResourceCard({
  resourceId,
  resourceType,
  chainId,
  identifier,
  alias,
  verificationStatus,
  owner,
  onClick,
}: ResourceCardProps) {
  const chainKey = String(chainId);
  const chainLabel = CHAIN_LABEL[chainKey] ?? `Chain ${chainKey}`;
  const typeLabel = TYPE_LABEL[resourceType] ?? `Type ${resourceType}`;
  const typeIcon = TYPE_ICON[resourceType] ?? '🔖';

  return (
    <button
      type="button"
      onClick={onClick}
      className="card w-full text-left p-5 transition-all hover:-translate-y-0.5"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'var(--brand-fog)' }}
          >
            {typeIcon}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
              {alias || truncate(identifier, 12, 8)}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{typeLabel}</span>
              <span>·</span>
              <span>{chainLabel}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={verificationStatus} />
      </div>

      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col gap-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span className="opacity-60">id</span>
            <span className="truncate">{truncate(resourceId, 14, 10)}</span>
          </div>
          {owner && (
            <div className="flex items-center gap-2">
              <span className="opacity-60">owner</span>
              <span className="truncate">{truncate(owner, 10, 6)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
