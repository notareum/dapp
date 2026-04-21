/**
 * Notareum Protocol contract addresses.
 *
 * These are placeholder addresses until mainnet/testnet deployment.
 * Update with real deployed addresses when available.
 */

import type { ContractAddresses } from '@notareum/sdk';

export const SEPOLIA_CONTRACTS: ContractAddresses = {
  notaToken: '0x0000000000000000000000000000000000000001',
  veNota: '0x0000000000000000000000000000000000000002',
  validatorStaking: '0x0000000000000000000000000000000000000003',
  notaRegistry: '0x0000000000000000000000000000000000000004',
  verificationEngine: '0x0000000000000000000000000000000000000005',
  slashingManager: '0x0000000000000000000000000000000000000006',
  feeManager: '0x0000000000000000000000000000000000000007',
  accessManager: '0x0000000000000000000000000000000000000008',
};

export const DEFAULT_CONTRACTS = SEPOLIA_CONTRACTS;
