'use client';

import { VerificationStatus } from '@notareum/sdk';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  [VerificationStatus.UNVERIFIED]: { label: 'Unverified', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' },
  [VerificationStatus.PENDING]: { label: 'Pending', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)' },
  [VerificationStatus.VERIFIED]: { label: 'Verified', color: '#059669', bg: 'rgba(5, 150, 105, 0.15)' },
  [VerificationStatus.DISPUTED]: { label: 'Disputed', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  [VerificationStatus.REVOKED]: { label: 'Revoked', color: '#991b1b', bg: 'rgba(153, 27, 27, 0.12)' },
};

export default function StatusBadge({ status }: { status: number }) {
  const entry = STATUS_MAP[status] ?? STATUS_MAP[VerificationStatus.UNVERIFIED];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: entry.color, background: entry.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
      {entry.label}
    </span>
  );
}
