# ⚡ FlowPay — India's Stablecoin Payment Super-Layer

> Built for **Superteam India × Dodo Payments Hackathon** · Solana Frontier 2025

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Dodo Payments](https://img.shields.io/badge/Powered%20by-Dodo%20Payments-FF6B35)](https://dodo.ac)
[![USDG](https://img.shields.io/badge/Stablecoin-USDG-00ff88)](https://dodo.ac)
[![Settlement](https://img.shields.io/badge/Settlement-%3C3s-00ff88)](/)
[![Live App](https://img.shields.io/badge/Live-Replit-purple?logo=replit)](https://flowpay-solanadodo.replit.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

FlowPay is a **full-stack stablecoin payment infrastructure** built for India, powered by **Dodo Payments** and settled on **Solana**. It combines five distinct payment rails into one unified platform — payroll, remittances, escrow, creator commerce, and AI agent payments — all settled in under 3 seconds using USDG.

This isn't a prototype. Every module works end-to-end: send a payment, get a real Solana transaction signature back, see your balances update in real time.

---

## 🌐 Live Demo

| | |
|---|---|
| **App (Replit)** | https://flowpay-solanadodo.replit.app |
| **API Health** | https://flowpay-solanadodo.replit.app/api/healthz |
| **Demo Login** | Email: `demo@flowpay.in` · Password: `demo123` |

---

## 🔶 Dodo Payments Integration — The Core of FlowPay

**This project is built specifically to demonstrate how Dodo Payments unlocks real-world stablecoin use cases for India.** Every payment rail in FlowPay sits on top of Dodo's infrastructure:

### How Dodo Powers Each Module

| Module | Dodo Integration |
|--------|-----------------|
| **PayRails** | Dodo's fiat-to-UPI rails deliver INR to recipients after USDG settlement on Solana |
| **RemitDirect** | Dodo's cross-border payment corridors (UAE→India, US→India, UK→India) handle last-mile INR delivery |
| **EscrowX** | Dodo processes milestone release payouts — locked USDG on Solana, released to INR via Dodo on trigger |
| **CreatorPay** | Dodo's payment acceptance layer collects USDG from global buyers and settles INR to Indian creators |
| **AgentBank** | Dodo's API infrastructure enables AI agents to make autonomous micropayments via x402 — machine-readable 402 responses trigger automatic Dodo payment execution |

### The FlowPay × Dodo Stack

```
User Action → USDG Transfer on Solana → Dodo Payment Rails → INR to UPI/Bank
```

- **Layer 1 — Solana:** Trustless settlement in <3 seconds. Transaction signatures serve as immutable receipts.
- **Layer 2 — USDG:** The Dodo stablecoin. Stable value, programmable, Solana-native.
- **Layer 3 — Dodo Payments:** Fiat on/off ramp, UPI delivery, cross-border corridors, payment acceptance.
- **Layer 4 — FlowPay:** The application layer — five purpose-built modules that package Dodo + Solana into real-world payment products.

### Why This Combination Is Powerful

India's payment problem isn't blockchain — it's the *bridge*. Solana can settle in 3 seconds, but someone still needs to put INR into a UPI account. Dodo Payments is that bridge. FlowPay builds on top of both so users get:

- The speed and transparency of Solana
- The reliability and reach of Dodo's fiat rails
- A UX that hides all of this complexity behind simple payment flows

---

## 🔑 How to Log In

FlowPay uses **wallet-based authentication** (demo mode also supports email/password for hackathon judges).

**Demo credentials:**
- Email: `demo@flowpay.in`
- Password: `demo123`
- Pre-loaded with $13,800+ in transaction volume across all 5 modules

**Wallet connect:**
1. Open the app and click **Connect Wallet →**
2. Choose Phantom, Backpack, or Solflare
3. Approve the connection — you're instantly inside the app
4. First time? Your account is created automatically

---

## 💡 What Problem Does FlowPay Solve?

India receives over **$100 billion in remittances every year**. The average international transfer takes 2–5 days and costs 5–8% in fees. FlowPay replaces this with Dodo + Solana:

| Old Way | FlowPay + Dodo |
|---------|----------------|
| 2–5 day settlement | Under 3 seconds |
| 5–8% fees | 0.5–2% |
| Wire transfers, SWIFT | Solana on-chain + Dodo rails |
| Middlemen everywhere | Trustless, on-chain |
| INR conversion manual | Built in (1 USDG = ₹83.52) |

---

## 📦 The 5 Payment Modules

---

### 💼 1. PayRails — Stablecoin Payroll
**Route:** `/payroll` · **Fee:** 0.5% · **Dodo Role:** UPI delivery of INR to recipient

PayRails lets any company pay Indian contractors in USDG, which converts to INR at the point of receipt via Dodo's UPI rails. No wire transfers. No 3–5 day delays.

**Flow:** Enter recipient UPI + USDG amount → Solana settles (~2.3s) → Dodo delivers INR to UPI → Transaction signature as proof

---

### 🌍 2. RemitDirect — Cross-Border Remittances
**Route:** `/remittance` · **Fee:** 0.75% · **Dodo Role:** Cross-border corridor management + INR delivery

Direct competitor to Western Union and Wise. UAE, US, UK, Singapore, Canada, Australia → India in under 2 seconds, for 0.75%. Dodo's corridor infrastructure handles the fiat side.

**The math:** Western Union: 3–8% on UAE→India. RemitDirect: 0.75%. On $500, that's $40 vs $3.75.

---

### 🔒 3. EscrowX — Smart Contract Escrow
**Route:** `/escrow` · **Fee:** 0.5% · **Dodo Role:** Milestone payout processing to INR

Trustless escrow for freelancers and clients. Funds locked in a Solana smart contract, released via Dodo on milestone completion. Dispute mechanism pauses payment instantly.

---

### 🎨 4. CreatorPay — Digital Product Commerce
**Route:** `/creator` · **Fee:** 2% · **Dodo Role:** Global payment acceptance + INR settlement to creators

Sell courses, ebooks, templates globally. Buyer pays USDG, Dodo settles INR to creator in seconds. No chargebacks. No 30-day holds. 2% vs Gumroad's 10%.

---

### 🤖 5. AgentBank — AI Agent Wallets
**Route:** `/agents` · **Fee:** 1% · **Dodo Role:** x402-compatible payment execution infrastructure

Each AI agent gets its own Solana wallet. Supports the **x402 payment-gating protocol** — HTTP `402 Payment Required` responses trigger automatic Dodo payment execution without human approval. Built for the autonomous economy.

---

## 🏗️ Architecture

```
FlowPay/
├── artifacts/
│   ├── api-server/      ← Express 5 REST API
│   └── flowpay/         ← React + Vite SPA
├── lib/
│   ├── api-spec/        ← OpenAPI 3.1 spec (50+ endpoints)
│   ├── api-zod/         ← Auto-generated Zod schemas + React Query hooks
│   └── db/              ← Drizzle ORM schema + PostgreSQL migrations
```

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
| State | Zustand + TanStack Query |
| Backend | Express 5 + Drizzle ORM + PostgreSQL |
| Validation | Zod |
| Auth | Solana wallet public key + Bearer token |
| Payment Layer | Dodo Payments (fiat rails) + Solana (settlement) |
| Stablecoin | USDG |

---

## 🗄️ Database Schema

10 tables covering every feature:

| Table | What it stores |
|-------|----------------|
| `users` | Wallet address, display handle |
| `wallets` | USDG + INR balances |
| `wallet_transactions` | Every balance movement |
| `payroll_payments` | PayRails tx records, Solana signatures |
| `remittances` | Cross-border transfers, corridors |
| `escrows` | Contract addresses, milestone status |
| `creator_products` | Product listings, price, type |
| `creator_sales` | Purchase records, buyer info |
| `agents` | Agent registry, x402 flag |
| `agent_transactions` | Per-agent payment history |

---

## 🔌 API Reference

All endpoints prefixed with `/api/`. Full OpenAPI 3.1 spec in `lib/api-spec/`.

```
POST /auth/wallet           Connect wallet → token
GET  /auth/me               Validate token
GET  /dashboard/stats       Aggregate volume across all modules
GET  /dashboard/activity    20 most recent transactions
GET  /wallet                Balance (USDG + INR)
GET  /payroll/payments      List payroll payments
POST /payroll/payments      Send payroll payment
GET  /remittances           List remittances
POST /remittances           Send cross-border remittance
GET  /escrows               List escrow contracts
POST /escrows               Create escrow
PATCH /escrows/:id/release  Release funds
PATCH /escrows/:id/dispute  Raise dispute
GET  /creator/products      Browse marketplace
POST /creator/products      List a product
POST /creator/products/:id/purchase  Buy a product
GET  /agents                List AI agents
POST /agents                Deploy agent
POST /agents/:id/fund       Fund agent wallet
POST /agents/:id/pay        Execute autonomous payment
GET  /rates                 Live exchange rates (USDG→INR/USD/AED/GBP)
GET  /healthz               Health check
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/jerreenj/FlowPay-SolanaDodo.git
cd FlowPay-SolanaDodo
pnpm install

# Environment
DATABASE_URL=postgresql://user:password@localhost:5432/flowpay
SESSION_SECRET=your-secret-here

pnpm --filter @workspace/db run push        # Push schema
pnpm --filter @workspace/api-server run dev  # Start API (port 8080)
pnpm --filter @workspace/flowpay run dev     # Start frontend
```

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

## 🏆 Why FlowPay Wins

| Criterion | FlowPay |
|-----------|---------|
| Dodo Payments integration | ✅ Core infrastructure — every module routes through Dodo |
| Real working product | ✅ 5 fully functional modules, not mockups |
| India-specific | ✅ UPI, INR, cross-border corridors built in |
| Solana-native | ✅ Every payment gets a Solana transaction signature |
| AI-ready | ✅ AgentBank + x402 for autonomous agent payments |
| Revenue model | ✅ Fee-based, earns from first transaction |
| Full-stack | ✅ Backend, frontend, database, OpenAPI spec |
| Production-deployed | ✅ Live on Replit right now |

---

## 📄 License

MIT © 2025 FlowPay — Built for Superteam India × Dodo Payments Hackathon · Solana Frontier
