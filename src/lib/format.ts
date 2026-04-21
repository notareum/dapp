/**
 * Number formatting utilities for the Notareum dApp.
 */

import { formatEther } from 'viem';

/**
 * Format a bigint token amount (18 decimals) for display.
 * Returns compact human-readable strings: "1,234.56", "50K", "1.2M"
 */
export function formatTokenAmount(
  value: bigint | undefined | null,
  opts?: { symbol?: string; decimals?: number }
): string {
  if (value === undefined || value === null || value === 0n) return '0';

  const symbol = opts?.symbol;
  const maxDecimals = opts?.decimals ?? 2;

  try {
    const raw = formatEther(value);
    const num = Number.parseFloat(raw);

    if (num === 0) return '0';
    if (num < 0.01 && num > 0) return suffix('<0.01', symbol);
    if (num < 1) return suffix(num.toFixed(maxDecimals), symbol);

    let formatted: string;
    if (num >= 1_000_000_000) {
      formatted = `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      formatted = `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 10_000) {
      formatted = `${(num / 1_000).toFixed(1)}K`;
    } else {
      formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
      });
    }

    return suffix(formatted, symbol);
  } catch {
    return '0';
  }
}

function suffix(value: string, symbol?: string): string {
  return symbol ? `${value} ${symbol}` : value;
}

/**
 * Format an ETH balance for display.
 */
export function formatEthBalance(value: bigint | undefined | null): string {
  if (value === undefined || value === null || value === 0n) return '0 ETH';
  try {
    const raw = formatEther(value);
    const num = Number.parseFloat(raw);
    if (num === 0) return '0 ETH';
    if (num < 0.0001) return '<0.0001 ETH';
    return `${num.toFixed(4)} ETH`;
  } catch {
    return '0 ETH';
  }
}

/**
 * Format a percentage, clamping to a reasonable number of decimals.
 */
export function formatPercent(
  numerator: bigint,
  denominator: bigint,
  decimals = 2
): string {
  if (denominator === 0n) return '0%';
  const pct = (Number(numerator) / Number(denominator)) * 100;
  return `${pct.toFixed(decimals)}%`;
}
