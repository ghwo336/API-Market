# API Market

> An on-chain API marketplace where agents can discover, pay for, and consume APIs in a single HTTP round-trip — powered by Base.

**Live:** https://monapi.pelicanlab.dev  
**Contract (Base Sepolia):** `0xE35053B2441B8DF180D83B7d620a9fE40fbe3Ae2`  
**Chain:** Base Sepolia (chainId: `84532`)

---

## What is API Market?

API Market is a decentralized marketplace for API services. Sellers register their APIs on-chain, buyers (including autonomous AI agents) pay per-call using ETH, and the gateway automatically settles each payment after verifying the API response.

The core flow implements an **x402-style** payment protocol:

```
1. GET /execute/{apiId}          → 402 Payment Required  (payment instructions)
2. call pay() on-chain           → txHash
3. GET /execute/{apiId}          → 200 OK  (API result + settlement tx)
   Header: X-Payment-Tx: {txHash}
```

This makes API Market natively compatible with AI agents — no OAuth, no API keys, just a wallet.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   API Market                        │
│                                                     │
│  Frontend (Next.js)   ←→   Backend (Express)        │
│       ↓                          ↓                  │
│  RainbowKit/wagmi          ApiMarketEscrow.sol       │
│  (wallet connect)          (Base Sepolia)            │
│                                                     │
│  Seller registers API → Admin approves on-chain     │
│  Buyer pays via contract → Gateway verifies & calls │
│  seller endpoint → Settles or refunds on-chain      │
└─────────────────────────────────────────────────────┘
```

**Monorepo packages:**

| Package | Description |
|---------|-------------|
| `packages/frontend` | Next.js 15 marketplace UI |
| `packages/backend` | Express.js gateway — payment verification, API proxying, event listening |
| `packages/shared` | Shared types, chain config, contract ABI |
| `packages/contracts` | Solidity smart contract (Hardhat + Ignition) |

---

## Smart Contract

`ApiMarketEscrow.sol` manages the full payment lifecycle on-chain.

**Key functions:**

| Function | Who | Description |
|----------|-----|-------------|
| `approveApi(apiId)` | Owner | Whitelist an API for payments |
| `pay(apiId, seller)` | Buyer | Escrow ETH for an API call |
| `complete(paymentId)` | Gateway | Release funds to seller (minus fee) |
| `refund(paymentId)` | Gateway | Refund buyer if seller API fails |
| `claim()` | Seller / Owner | Withdraw accumulated earnings |

**Events:** `PaymentReceived`, `PaymentCompleted`, `PaymentRefunded`, `ApiApproved`

Fee rate: **5%** (500 basis points, max 30%)

---

## Agent Integration

Agents can call any API on the marketplace with ~10 lines of TypeScript:

```typescript
import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const CONTRACT = "0xE35053B2441B8DF180D83B7d620a9fE40fbe3Ae2";
const BASE_URL = "https://monapi.pelicanlab.dev/api";
const PAY_ABI = parseAbi(["function pay(uint256 apiId, address seller) payable"]);

async function callAPI(apiId: string, privateKey: `0x${string}`, payload?: object) {
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport: http() });
  const client = createPublicClient({ chain: baseSepolia, transport: http() });

  // 1. Get payment info
  const info = await fetch(`${BASE_URL}/execute/${apiId}`).then(r => r.json());
  const { amount, onChainApiId, seller } = info.x402;

  // 2. Pay on-chain
  const txHash = await wallet.writeContract({
    address: CONTRACT, abi: PAY_ABI, functionName: "pay",
    args: [BigInt(onChainApiId), seller], value: BigInt(amount),
  });
  await client.waitForTransactionReceipt({ hash: txHash });

  // 3. Get result
  return fetch(`${BASE_URL}/execute/${apiId}`, {
    method: payload ? "POST" : "GET",
    headers: { "X-Payment-Tx": txHash, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  }).then(r => r.json());
}
```

See [AGENT_API.md](./AGENT_API.md) for the full agent guide.

---

## Development

### Prerequisites
- Node.js 20+, pnpm
- Docker & Docker Compose
- A Base Sepolia wallet with test ETH ([faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))

### Setup

```bash
# Install dependencies
pnpm install

# Copy and fill env
cp .env.example .env

# Run locally
docker compose up -d        # postgres
pnpm --filter @apimarket/backend db:migrate
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PRIVATE_KEY` | Gateway wallet private key |
| `CONTRACT_ADDRESS` | Deployed `ApiMarketEscrow` address |
| `RPC_URL` | Base Sepolia RPC (default: `https://sepolia.base.org`) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Same contract address for frontend |
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Base Sepolia) |

### Contract Deployment

```bash
cd packages/contracts
cp .env.example .env      # add PRIVATE_KEY
pnpm deploy:testnet       # deploys to Base Sepolia
pnpm copy-abi             # syncs ABI to shared package
```

### Production Deploy

```bash
docker compose build
docker compose up -d
```

---

## Tech Stack

- **Frontend:** Next.js 15, RainbowKit, wagmi, viem, Tailwind CSS
- **Backend:** Express.js, Prisma, PostgreSQL, viem
- **Contracts:** Solidity 0.8.28, Hardhat, Hardhat Ignition
- **Chain:** Base Sepolia (testnet) / Base Mainnet
- **Infra:** Docker Compose, Nginx

---

## License

MIT
