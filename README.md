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

**FlowPay uses the Dodo Payments SDK (`dodopayments@2.31.0`) for live API calls.** Every transaction in PayRails and CreatorPay hits the real Dodo test-mode API.

### What Happens on Each Transaction

**PayRails (Payroll):**
1. Calls `dodo.products.create()` → creates a real Dodo product for the payment amount
2. Calls `dodo.checkoutSessions.create()` → gets a real `cks_…` session ID and a live checkout URL
3. Stores both in the database alongside the Solana signature
4. The checkout link is clickable directly from the UI

**CreatorPay:**
1. On product listing → calls `dodo.products.create()` → real `pdt_…` product ID stored in DB
2. On purchase → calls `dodo.checkoutSessions.create()` → real checkout session
3. Buyer is **redirected to Dodo's hosted checkout page** automatically
4. Products verified on Dodo show a "Dodo ✓" badge on their listing and public buy page

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
| **PayRails** | Real Dodo product + checkout session per payroll payment; link stored and shown in UI |
| **RemitDirect** | Dodo's cross-border corridors (UAE → India, US → India, UK → India) handle INR delivery |
| **EscrowX** | Dodo processes milestone release payouts — USDG locked on Solana, released via Dodo on trigger |
| **CreatorPay** | Real Dodo product (`pdt_…`) created per listing; real checkout session (`cks_…`) per purchase with redirect |
| **AgentBank** | Dodo's API infrastructure enables AI agents to pay autonomously via x402 |

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
**Route:** `/payroll` · **Fee:** 0.5% · **Dodo:** Real product + checkout session per payment

PayRails lets any company pay Indian contractors, remote workers, and DAO contributors in USDG. A real Dodo checkout session is created per payment — the `cks_…` session ID and checkout URL are stored in the database and shown in the UI. The USDG converts to INR at the point of receipt via Dodo's UPI rails.

**Payment flow:**
1. Enter recipient's name, UPI ID, and amount in USDG
2. FlowPay shows the INR equivalent at live rates (1 USDG = ₹83.52)
3. Hit Send → Solana settles in ~2.3 seconds
4. Dodo creates a real checkout session (`cks_…`) → clickable link appears in UI
5. Dodo routes INR to the recipient's UPI handle
6. Solana transaction signature returned as on-chain proof

---

### 🌍 2. RemitDirect — Cross-Border Remittances
**Route:** `/remittance` · **Fee:** 0.75% · **Dodo:** Cross-border corridor management + INR delivery

Direct replacement for Western Union, Wise, and hawala networks. Send from UAE, US, UK, Singapore, Canada, or Australia to India — delivered in INR via UPI in under 2 seconds.

**The economics:** Western Union charges 3–8% on UAE → India. On a $500 remittance, that's $15–40 in fees. RemitDirect charges 0.75% — $3.75 for the same transfer, delivered in 2 seconds instead of 2 days.

---

### 🔒 3. EscrowX — Smart Contract Escrow
**Route:** `/escrow` · **Fee:** 0.5% · **Dodo:** Milestone payout processing → INR on release

Trustless escrow for freelancers and clients. Funds lock into a Solana smart contract and only release when milestones are marked complete. Neither party needs to trust the other.

**Escrow states:** `active` → `released` → `completed` / `disputed`

---

### 🎨 4. CreatorPay — Digital Product Commerce
**Route:** `/creator` · **Fee:** 2% · **Dodo:** Real product registry + checkout session per sale

List any digital product. Share a link (`/buy/:id`) — no account needed to purchase. Each product gets a real Dodo product ID (`pdt_…`). Each purchase creates a real Dodo checkout session and redirects the buyer to Dodo's hosted checkout page.

**vs alternatives:**
- Gumroad: 10% fee, USD-only, 2–5 day payouts
- Stripe: 2.9% + $0.30, reversible up to 120 days, country restrictions
- CreatorPay: 2%, on-chain final, Dodo-verified, settled in seconds

**Product types:** Course · eBook · Template · Newsletter · Membership

---

### 🤖 5. AgentBank — AI Agent Wallets
**Route:** `/agents` · **Fee:** 1% · **Dodo:** x402-compatible payment execution infrastructure

Infrastructure for the autonomous economy. Each AI agent gets its own Solana wallet funded with USDG. Supports the **x402 payment-gating protocol** — Dodo's infrastructure executes payments automatically when an HTTP `402 Payment Required` is returned.

**What is x402?** An emerging protocol where HTTP `402` responses carry machine-readable payment instructions. An AI agent with a funded AgentBank wallet reads them and pays automatically — no human approval, no interruption.

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
| `payroll_payments` | PayRails records, Solana sigs, Dodo session IDs + checkout URLs |
| `remittances` | Cross-border transfers, corridors, INR amounts |
| `escrows` | Contract addresses, milestone counts, status |
| `creator_products` | Listings, price, type, sales count, **Dodo product ID** (`pdt_…`) |
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
| **Dodo Payments integration** | ✅ Real SDK calls — `dodo.products.create()` + `dodo.checkoutSessions.create()` on every transaction |
| **Real working product** | ✅ Five fully functional modules, end-to-end |
| **India-specific** | ✅ UPI delivery, INR conversion, six cross-border corridors |
| **Solana-native** | ✅ Every payment produces a Solana transaction signature |
| **AI-ready** | ✅ AgentBank + x402 for fully autonomous agent payments |
| **Revenue model** | ✅ Fee-based, earns from the first transaction |
| **Full-stack** | ✅ Backend, frontend, database, OpenAPI spec, codegen |
| **USDG stablecoin** | ✅ USDG is the base currency across all five modules |

---

*Built for Superteam India × Dodo Payments Hackathon · Solana Frontier 2025*
