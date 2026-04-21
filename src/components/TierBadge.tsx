'use client';

import { ValidatorTier } from '@notareum/sdk';

const TIER_MAP: Record<number, { label: string; color: string; bg: string; border: string }> = {
  [ValidatorTier.NONE]: { label: 'None', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)' },
  [ValidatorTier.BRONZE]: { label: 'Bronze', color: '#b45309', bg: 'rgba(180, 83, 9, 0.12)', border: 'rgba(180, 83, 9, 0.35)' },
  [ValidatorTier.SILVER]: { label: 'Silver', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.4)' },
  [ValidatorTier.GOLD]: { label: 'Gold', color: '#b07b0a', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' },
  [ValidatorTier.PLATINUM]: { label: 'Platinum', color: '#3a6fe5', bg: 'rgba(58, 111, 229, 0.15)', border: 'rgba(58, 111, 229, 0.4)' },
};

export default function TierBadge({ tier, size = 'md' }: { tier: number; size?: 'sm' | 'md' | 'lg' }) {
  const entry = TIER_MAP[tier] ?? TIER_MAP[ValidatorTier.NONE];
  const sizeClass = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
      style={{ color: entry.color, background: entry.bg, border: `1px solid ${entry.border}` }}
    >
      {entry.label}
    </span>
  );
}
