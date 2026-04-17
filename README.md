# ChainLens

> An on-chain API marketplace where agents can discover, pay for, and consume APIs in a single HTTP round-trip — powered by Base.

**Live:** https://monapi.pelicanlab.dev  
**Contract (Base Sepolia):** `0xDAa04e9BD451F9D27EcEd569303181c71F0A7b27`  
**Chain:** Base Sepolia (chainId: `84532`)  
**Payment Token:** USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

---

## What is ChainLens?

ChainLens is a marketplace for API services with on-chain payments. Sellers register their APIs and await admin approval, buyers (including autonomous AI agents) pay per-call using USDC via smart contract escrow, and a centralized gateway verifies the API response and settles each payment on-chain.

The core flow implements an **x402-style** payment protocol:

```
1. GET /execute/{apiId}          → 402 Payment Required  (payment instructions)
2. approve USDC + call pay() on-chain  → txHash
3. GET /execute/{apiId}          → 200 OK  (API result + settlement tx)
   Header: X-Payment-Tx: {txHash}
```

This makes ChainLens natively compatible with AI agents — no OAuth, no API keys, just a wallet.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ChainLens                        │
│                                                     │
│  Frontend (Next.js)   ←→   Backend (Express)        │
│       ↓                          ↓                  │
│  RainbowKit/wagmi          ApiMarketEscrow.sol       │
│  (wallet connect)          (Base Sepolia)            │
│                                                     │
│  Seller registers API → Admin approves on-chain     │
│  Buyer pays USDC via contract → Gateway verifies    │
│  & calls seller endpoint → Settles or refunds       │
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

`ApiMarketEscrow.sol` manages the full payment lifecycle on-chain using USDC (ERC-20).

**Key functions:**

| Function | Who | Description |
|----------|-----|-------------|
| `approveApi(apiId)` | Owner | Whitelist an API for payments |
| `pay(apiId, seller, amount)` | Buyer | Transfer USDC into escrow for an API call |
| `complete(paymentId)` | Gateway | Release USDC to seller (minus fee) |
| `refund(paymentId)` | Gateway | Refund buyer if seller API fails |
| `claim()` | Seller / Owner | Withdraw accumulated USDC earnings |

**Events:** `PaymentReceived`, `PaymentCompleted`, `PaymentRefunded`, `ApiApproved`

Fee rate: **5%** (500 basis points, max 30%)

---

## Agent Integration

Agents can call any API on the marketplace with ~15 lines of TypeScript:

```typescript
import { createWalletClient, createPublicClient, http, parseAbi, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const CONTRACT = "0xDAa04e9BD451F9D27EcEd569303181c71F0A7b27";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const BASE_URL = "https://monapi.pelicanlab.dev/api";
const PAY_ABI = parseAbi(["function pay(uint256 apiId, address seller, uint256 amount) nonpayable"]);
const APPROVE_ABI = parseAbi(["function approve(address spender, uint256 amount) nonpayable returns (bool)"]);

async function callAPI(apiId: string, privateKey: `0x${string}`, payload?: object) {
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport: http() });
  const client = createPublicClient({ chain: baseSepolia, transport: http() });

  // 1. Get payment info
  const info = await fetch(`${BASE_URL}/execute/${apiId}`).then(r => r.json());
  const { amount, onChainApiId, seller } = info.x402;

  // 2. Approve USDC spend
  const approveTx = await wallet.writeContract({
    address: USDC, abi: APPROVE_ABI, functionName: "approve",
    args: [CONTRACT, BigInt(amount)],
  });
  await client.waitForTransactionReceipt({ hash: approveTx });

  // 3. Pay on-chain
  const txHash = await wallet.writeContract({
    address: CONTRACT, abi: PAY_ABI, functionName: "pay",
    args: [BigInt(onChainApiId), seller, BigInt(amount)],
  });
  await client.waitForTransactionReceipt({ hash: txHash });

  // 4. Get result
  return fetch(`${BASE_URL}/execute/${apiId}`, {
    method: payload ? "POST" : "GET",
    headers: { "X-Payment-Tx": txHash, "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
  }).then(r => r.json());
}
```

---

## Development

### Prerequisites
- Node.js 20+, pnpm
- Docker & Docker Compose
- A Base Sepolia wallet with USDC ([Circle faucet](https://faucet.circle.com))

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
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC token address for frontend |
| `NEXT_PUBLIC_CHAIN_ID` | `84532` (Base Sepolia) |

### Contract Deployment

```bash
cd packages/contracts
npx hardhat ignition deploy ignition/modules/ApiMarketEscrow.ts \
  --network baseSepolia \
  --parameters ignition/parameters.json
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
- **Payment:** USDC (ERC-20, 6 decimals)
- **Infra:** Docker Compose, Nginx

---

## License

MIT
