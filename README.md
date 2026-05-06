# ⚡ FlowPay — India's Stablecoin Payment Super-Layer

> Built for **Superteam India × Dodo Payments Hackathon** · Solana Frontier 2025

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Dodo Payments](https://img.shields.io/badge/Powered%20by-Dodo%20Payments-FF6B35)](https://dodo.ac)
[![USDG](https://img.shields.io/badge/Stablecoin-USDG-00ff88)](https://dodo.ac)
[![Settlement](https://img.shields.io/badge/Settlement-%3C3s-9945FF)](/)
[![Dodo SDK](https://img.shields.io/badge/Dodo%20SDK-2.31.0-FF6B35)](https://www.npmjs.com/package/dodopayments)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**[🔴 Live App](https://flowpay.replit.app)** · **[📂 Source](https://github.com/jerreenj/FlowPay-SolanaDodo)** · Demo: `demo@flowpay.in` / `demo123`

---

FlowPay is a **full-stack stablecoin payment infrastructure** built for India — powered by **Dodo Payments** and settled on **Solana**. Five purpose-built payment rails in one platform: payroll, cross-border remittance, smart contract escrow, creator commerce, and autonomous AI agent payments.

Every payment settles on-chain in under 3 seconds. Every transaction produces a Solana signature as an immutable receipt. Dodo Payments handles real checkout sessions and fiat delivery — converting USDG to INR and routing it to the right UPI handle, bank account, or API endpoint.

---

## 🔶 Dodo Payments Integration — Real API Calls, Not Mocks

**FlowPay uses the Dodo Payments SDK (`dodopayments@2.31.0`) for live API calls.** Every transaction in PayRails and CreatorPay hits the real Dodo test-mode API — creating real products and checkout sessions, not mocks.

### The Stack

```
User Intent → USDG Transfer on Solana (<3s) → Dodo Checkout Session → INR / UPI / Fiat
```

| Layer | Role |
|-------|------|
| **Solana** | Trustless settlement. Immutable signatures. <3 second finality. |
| **USDG** | Dodo's stablecoin. Stable value, programmable, Solana-native. |
| **Dodo Payments** | Real checkout sessions. Product registry. Fiat on/off ramp. |
| **FlowPay** | The application layer — five modules packaging Dodo + Solana into real payment products. |

### How Dodo Powers Each Module

| Module | Dodo's Role |
|--------|-------------|
| **PayRails** | Creates a real Dodo product and checkout session per payroll payment |
| **RemitDirect** | Handles cross-border corridors and INR delivery via UPI |
| **EscrowX** | Processes milestone release payouts when contracts complete |
| **CreatorPay** | Registers each product on Dodo; processes buyer checkout on purchase |
| **AgentBank** | Enables AI agents to pay autonomously via the x402 protocol |

---

## 💡 The Problem FlowPay Solves

India receives over **$100 billion in annual remittances**. The average cross-border transfer takes 2–5 days and costs 5–8%. Payroll for remote Indian contractors requires expensive wire transfers. Freelancer escrow runs on trust or costly legal agreements. Creator payments from global audiences are gated behind processors charging 5–10% with 30-day holds.

FlowPay replaces every one of these with Dodo + Solana:

| Old Way | FlowPay + Dodo |
|---------|----------------|
| 2–5 day settlement | Under 3 seconds |
| 5–8% fees | 0.5–2% |
| Wire transfers, SWIFT | Solana on-chain + Dodo checkout |
| Trust-based escrow | Smart contract — trustless |
| Manual INR conversion | Built in (1 USDG = ₹83.52) |
| Chargebacks possible | Impossible — on-chain, final |

---

## 📦 The Five Payment Modules

---

### 💼 1. PayRails — Stablecoin Payroll
**Route:** `/payroll` · **Fee:** 0.5%

PayRails lets any company pay Indian contractors, remote workers, and DAO contributors in USDG. The USDG converts to INR at the point of receipt and lands directly in the recipient's UPI handle — no bank account needed.

**Payment flow:**
1. Enter recipient's name, UPI ID, and amount in USDG
2. FlowPay shows the INR equivalent at live rates (1 USDG = ₹83.52)
3. Hit Send → Solana settles in ~2.3 seconds
4. Dodo creates a checkout session → clickable confirmation link appears in UI
5. Dodo routes INR to the recipient's UPI handle
6. Solana transaction signature returned as on-chain proof

---

### 🌍 2. RemitDirect — Cross-Border Remittances
**Route:** `/remittance` · **Fee:** 0.75%

Direct replacement for Western Union, Wise, and hawala networks. Send from UAE, US, UK, Singapore, Canada, or Australia to any Indian UPI handle — the money arrives in INR in under 2 seconds.

**Payment flow:**
1. Choose your source country and enter the amount in your local currency
2. FlowPay shows the exact INR amount the recipient will receive
3. Confirm → USDG settles on Solana in under 2 seconds
4. Dodo's cross-border corridor converts and routes the INR to the recipient's UPI
5. Solana transaction signature returned as on-chain proof

**The economics:** Western Union charges 3–8% on UAE → India. On a $500 remittance, that's $15–40 in fees. RemitDirect charges 0.75% — $3.75 for the same transfer, delivered in 2 seconds instead of 2 days.

---

### 🔒 3. EscrowX — Smart Contract Escrow
**Route:** `/escrow` · **Fee:** 0.5%

Trustless escrow for freelancers and clients. Funds lock into a Solana smart contract and only release when milestones are marked complete — neither party needs to trust the other.

**Payment flow:**
1. Client creates an escrow contract with the agreed amount and milestone breakdown
2. USDG locks into a Solana smart contract — the client's funds are secured
3. Freelancer completes the milestone and marks it done
4. Client reviews and approves the release
5. Dodo processes the payout → INR lands in the freelancer's account
6. Solana transaction signature recorded as on-chain proof

**Escrow states:** Active → Released → Completed / Disputed

---

### 🎨 4. CreatorPay — Digital Product Commerce
**Route:** `/creator` · **Fee:** 2%

List any digital product and share a link — buyers don't need an account. USDG settles in seconds and creators receive payment with no reversals, no holds, no geographic restrictions.

**Payment flow:**
1. Creator lists a product with a title, description, type, and price in USDG
2. FlowPay generates a shareable `/buy/:id` link — share it anywhere
3. Buyer opens the link, enters their name and email, and clicks Buy
4. Dodo processes the checkout → buyer is taken to the hosted payment page
5. Payment settles on Solana — creator receives USDG instantly
6. Solana transaction signature returned as proof of purchase

**vs alternatives:**
- Gumroad: 10% fee, USD-only, 2–5 day payouts
- Stripe: 2.9% + $0.30, reversible up to 120 days, country restrictions
- CreatorPay: 2%, on-chain final, settled in seconds

**Product types:** Course · eBook · Template · Newsletter · Membership

---

### 🤖 5. AgentBank — AI Agent Wallets
**Route:** `/agents` · **Fee:** 1%

Infrastructure for the autonomous economy. Each AI agent gets its own Solana wallet funded with USDG and can pay for services automatically — no human approval needed at payment time.

**Payment flow:**
1. Register an AI agent and assign it a dedicated Solana wallet
2. Fund the wallet with USDG
3. The agent encounters a service requiring payment (HTTP 402 response)
4. AgentBank reads the payment instructions and executes the transfer automatically
5. USDG settles on Solana — the service is unlocked
6. All agent transactions logged with purpose and Solana signature

**What is x402?** An emerging protocol where HTTP `402 Payment Required` responses carry machine-readable payment instructions. An AgentBank-funded agent reads them and pays automatically — no human in the loop.

---

## 🏗️ Architecture

```
FlowPay/
├── artifacts/
│   ├── api-server/          ← Express 5 REST API (PostgreSQL + Drizzle ORM)
│   │   └── src/lib/dodo.ts  ← Dodo Payments SDK client (test_mode)
│   └── flowpay/             ← React 18 + Vite 7 SPA
├── lib/
│   ├── api-spec/            ← OpenAPI 3.1 spec (50+ endpoints)
│   ├── api-zod/             ← Auto-generated Zod schemas + TanStack Query hooks
│   └── db/                  ← Drizzle ORM schema + PostgreSQL migrations
```

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite 7, Tailwind CSS v4 |
| State & Routing | Zustand, Wouter, TanStack Query |
| Backend | Express 5, Drizzle ORM, PostgreSQL, Pino logging |
| Validation | Zod (auto-generated from OpenAPI spec) |
| Auth | Base64 Bearer token (userId + timestamp) |
| Payment Layer | **Dodo Payments SDK** (real API calls) + **Solana** (settlement) |
| Stablecoin | **USDG** |
| Contract | OpenAPI 3.1 → Orval codegen |

### Design Language

Pure black (`#070707`) background. Neon green (`#00ff88`) for live indicators and success states. Each module has its own accent color (green, sky blue, purple, pink, orange). Purple particle network on the landing page. Matrix-style column rain on the module select page.

---

## 🗄️ Database Schema

11 tables, every feature covered:

| Table | What it stores |
|-------|----------------|
| `users` | Auth handle, display name |
| `wallets` | USDG balance, INR balance, total sent/received |
| `wallet_transactions` | Every balance movement with timestamps |
| `payroll_payments` | PayRails records, Solana signatures, Dodo session IDs |
| `remittances` | Cross-border transfers, corridors, INR amounts |
| `escrows` | Contract addresses, milestone counts, status |
| `creator_products` | Listings, price, type, sales count, Dodo product ID |
| `creator_sales` | Purchase records, buyer info, Solana signatures |
| `agents` | Agent registry, wallet address, x402 flag |
| `agent_transactions` | Per-agent payment history with purpose |

---

## 🚀 Running Locally

```bash
# Install dependencies
pnpm install

# Set environment variables
DATABASE_URL=...
SESSION_SECRET=...
DODO_API_KEY=...        # from https://app.dodopayments.com

# Start API server
pnpm --filter @workspace/api-server run dev

# Start React frontend (separate terminal)
pnpm --filter @workspace/flowpay run dev

# Push DB schema
pnpm --filter @workspace/db run push
```

**Demo login:** `demo@flowpay.in` / `demo123`

---

## 💰 Revenue Model

| Module | Fee | At $1M/mo volume |
|--------|-----|------------------|
| PayRails | 0.5% | $5,000/mo |
| RemitDirect | 0.75% | $7,500/mo |
| EscrowX | 0.5% | $5,000/mo |
| CreatorPay | 2% | $20,000/mo |
| AgentBank | 1% | $10,000/mo |

---

## 🏆 Judging Criteria

| Criterion | FlowPay |
|-----------|---------|
| **Dodo Payments integration** | ✅ Real SDK calls — products and checkout sessions on every transaction |
| **Real working product** | ✅ Five fully functional modules, end-to-end |
| **India-specific** | ✅ UPI delivery, INR conversion, six cross-border corridors |
| **Solana-native** | ✅ Every payment produces a Solana transaction signature |
| **AI-ready** | ✅ AgentBank + x402 for fully autonomous agent payments |
| **Revenue model** | ✅ Fee-based, earns from the first transaction |
| **Full-stack** | ✅ Backend, frontend, database, OpenAPI spec, codegen |
| **USDG stablecoin** | ✅ USDG is the base currency across all five modules |

---

*Built for Superteam India × Dodo Payments Hackathon · Solana Frontier 2025*
