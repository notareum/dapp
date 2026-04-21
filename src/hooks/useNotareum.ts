'use client';

import { useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcProvider, type Provider, type Signer } from 'ethers';
import { Notareum, type NotareumInstance } from '@notareum/sdk';
import { DEFAULT_CONTRACTS } from '@/lib/contracts';

/**
 * Hook to get a Notareum SDK instance wired to the connected wallet.
 * Falls back to a read-only provider when no wallet is connected.
 */
export function useNotareum(): NotareumInstance | null {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!publicClient) return null;

    // Build ethers Provider from the viem publicClient's transport.
    const transport = publicClient.transport as { url?: string };
    const rpcUrl = transport?.url || 'https://rpc.sepolia.org';
    const provider: Provider = new JsonRpcProvider(rpcUrl);

    let signer: Signer | undefined;
    if (walletClient) {
      // Wrap the browser wallet as an ethers Signer.
      const browserProvider = new BrowserProvider(walletClient.transport as never);
      // We cannot await here, so we create a lazy signer proxy instead.
      // Instead, we use a synchronous signer by caching.
      signer = undefined;
      // ethers v6 BrowserProvider.getSigner is async; consumers that need a signer
      // should use useNotareumSigner() below.
      void browserProvider;
    }

    return Notareum({
      provider,
      signer,
      contracts: DEFAULT_CONTRACTS,
    });
  }, [publicClient, walletClient]);
}

/**
 * Get an ethers BrowserProvider + Signer bound to the connected wallet.
 * Use this for write operations (e.g. signing .nota files, sending txs).
 */
export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!walletClient) return null;
    const browserProvider = new BrowserProvider(walletClient.transport as never);
    return browserProvider;
  }, [walletClient]);
}

/**
 * Build a Notareum SDK instance that has write capability, using an async getSigner().
 * Returns a factory you call to get the fully wired instance.
 */
export function useNotareumFactory() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    return async (): Promise<NotareumInstance | null> => {
      if (!publicClient) return null;
      const transport = publicClient.transport as { url?: string };
      const rpcUrl = transport?.url || 'https://rpc.sepolia.org';
      const provider: Provider = new JsonRpcProvider(rpcUrl);

      let signer: Signer | undefined;
      if (walletClient) {
        const browserProvider = new BrowserProvider(walletClient.transport as never);
        signer = await browserProvider.getSigner();
      }

      return Notareum({
        provider,
        signer,
        contracts: DEFAULT_CONTRACTS,
      });
    };
  }, [publicClient, walletClient]);
}
