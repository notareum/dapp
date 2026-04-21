<div align="center">

# Notareum dApp

**The Trust Layer for Web3**

Register resources, create .nota files, stake NOTA, and participate in the verification network.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![wagmi](https://img.shields.io/badge/wagmi-Web3-black)](https://wagmi.sh/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Live App](https://app.notareum.com) · [Website](https://notareum.com) · [Protocol Spec](https://github.com/notareum/protocol)

</div>

## Overview

The Notareum dApp is the primary interface for interacting with the Notareum Protocol. It connects to the on-chain smart contracts via the [`@notareum/sdk`](https://github.com/notareum/notareum-ts-sdk) and provides a complete workflow for resource registration, verification, staking, and governance.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Branded entry page with wallet connection |
| `/dashboard` | Overview: resources, staking position, voting power, quick actions |
| `/registry` | Register resources, search by ID or alias, manage owned resources |
| `/nota` | Create, sign, download, import, and verify .nota files |
| `/verification` | Request verification, view status, validator attestation panel |
| `/staking` | Stake/unstake NOTA, view tier, daily verification limits |
| `/governance` | Lock NOTA for veNOTA, manage locks, view voting power |
| `/explorer` | Search resources, browse protocol activity |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework (App Router) |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 3** | Styling |
| **wagmi + viem** | Wallet connection and chain interaction |
| **ConnectKit** | Wallet modal UI |
| **@notareum/sdk** | Protocol SDK (contract clients + core) |
| **ethers v6** | Signer bridge for SDK |
| **next-themes** | Dark/light mode |

## Project Structure

```
src/
├── app/
│   ├── (entry)/page.tsx        # Landing/connect page
│   ├── (app)/layout.tsx        # Sidebar layout wrapper
│   ├── (app)/dashboard/        # Dashboard
│   ├── (app)/registry/         # Resource registry
│   ├── (app)/nota/             # .nota file operations
│   ├── (app)/verification/     # Verification requests
│   ├── (app)/staking/          # Validator staking
│   ├── (app)/governance/       # veNOTA governance
│   ├── (app)/explorer/         # Protocol explorer
│   ├── layout.tsx              # Root layout (providers)
│   └── globals.css             # Design system (CSS vars)
├── components/
│   ├── Sidebar.tsx             # Collapsible sidebar nav
│   ├── Web3Provider.tsx        # wagmi + ConnectKit provider
│   ├── ConnectButton.tsx       # Wallet connect button
│   ├── StatusBadge.tsx         # Verification status badge
│   ├── TierBadge.tsx           # Validator tier badge
│   ├── ResourceCard.tsx        # Resource display card
│   └── PageHeader.tsx          # Page title component
├── hooks/
│   └── useNotareum.ts          # SDK integration hook
├── lib/
│   ├── contracts.ts            # Contract addresses (Sepolia)
│   └── format.ts               # Token amount formatting
└── public/                     # Logos, favicons, assets
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/notareum/dapp.git
cd dapp
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect a wallet on Sepolia testnet.

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Network

Currently targeting **Ethereum Sepolia** testnet. Contract addresses are configured in `src/lib/contracts.ts` (placeholder addresses until mainnet deployment).

## Contributing

1. Branch from `main`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/)
3. One logical change per commit
4. Run `npm run lint` before opening a PR

## License

[MIT](LICENSE)
