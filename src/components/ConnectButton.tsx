'use client';

import { ConnectKitButton } from 'connectkit';

interface ConnectButtonProps {
  variant?: 'primary' | 'secondary' | 'compact';
  fullWidth?: boolean;
}

export default function ConnectButton({ variant = 'primary', fullWidth = false }: ConnectButtonProps) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        const label = isConnected ? (ensName ?? truncatedAddress) : 'Connect Wallet';

        if (variant === 'compact') {
          return (
            <button
              type="button"
              onClick={show}
              className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: isConnected ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : 'var(--brand)',
                color: isConnected ? 'var(--brand)' : '#ffffff',
                border: '1px solid ' + (isConnected ? 'color-mix(in srgb, var(--brand) 30%, transparent)' : 'var(--brand)'),
              }}
            >
              {label}
            </button>
          );
        }

        if (variant === 'secondary') {
          return (
            <button
              type="button"
              onClick={show}
              className={`btn-secondary btn-secondary-fill-hover text-sm justify-center ${fullWidth ? 'w-full' : ''}`}
            >
              {label}
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={show}
            className={`btn-primary text-sm justify-center ${fullWidth ? 'w-full' : ''}`}
          >
            {label}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
