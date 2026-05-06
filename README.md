# ⚡ FlowPay — India's Stablecoin Payment Super-Layer

> Built for **Superteam India × Dodo Payments Hackathon** · Solana Frontier 2025

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![USDG](https://img.shields.io/badge/Stablecoin-USDG-00ff88)](https://dodo.ac)
[![Settlement](https://img.shields.io/badge/Settlement-%3C3s-00ff88)](/)
[![Live](https://img.shields.io/badge/Live-Vercel-black?logo=vercel)](https://flowpay-solanadodo.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

FlowPay is a **full-stack stablecoin payment infrastructure** built for India. It combines five distinct payment rails into one unified platform — payroll, remittances, escrow, creator commerce, and AI agent payments — all settled on Solana in under 3 seconds using USDG.

This isn't a prototype. Every module works end-to-end: send a payment, get a real Solana transaction signature back, see your balances update in real time.

---

## 🌐 Live Demo

| | |
|---|---|
| **App (Vercel)** | https://flowpay-solanadodo.vercel.app |
| **API (Replit)** | https://Flowpay-Solana.replit.app/api/healthz |

---

## 🔑 How to Log In — Wallet Connect, No Password

FlowPay uses **wallet-only authentication**. No email. No password. No username. Your Solana wallet address is your entire identity.

**To get started:**
1. Open the app and click **Connect Wallet →**
2. A wallet picker appears — choose **Phantom**, **Backpack**, or **Solflare**
3. Your wallet extension pops up asking you to approve the connection
4. Click Approve — you're instantly inside the app

**First time connecting?** Your account is created automatically in the background. FlowPay uses your public wallet address to create a profile — nothing private is ever stored or transmitted. No personal data at all.

**Already connected before?** You're logged straight in. No steps, no forms.

The wallet picker shows you which wallets are installed in your browser (marked "Ready") and which aren't (with a direct install link). If none are installed, there are links to download Phantom, Backpack, or Solflare.

---

## 💡 What Problem Does FlowPay Solve?

India receives over **$100 billion in remittances every year**. The average international transfer takes 2–5 days and costs 5–8% in fees. Payroll for remote Indian contractors requires expensive wire transfers or fintech middlemen. Freelancer escrow is done on trust or through costly legal agreements. Creator payments from global audiences are gated behind processors that charge 3–5% and hold funds for weeks.

FlowPay replaces all of this with USDG on Solana:

| Old Way | FlowPay |
|---------|---------|
| 2–5 day settlement | Under 3 seconds |
| 5–8% fees | 0.5–2% |
| Wire transfers, SWIFT | Solana on-chain |
| Middlemen everywhere | Trustless, on-chain |
| INR conversion manual | Built in (1 USDG = ₹83.52) |

---

## 📦 The 5 Payment Modules

---

### 💼 1. PayRails — Stablecoin Payroll
**Route:** `/payroll` &nbsp;·&nbsp; **Fee:** 0.5%

PayRails lets any company pay Indian contractors and remote workers in USDG, which converts to INR at the point of receipt. No wire transfers. No 3–5 day delays. No expensive payroll processors.

**How a payment works:**
1. Enter the recipient's name, UPI ID, and the amount in USDG
2. FlowPay shows the INR equivalent at live rates
3. Hit Send — the payment settles on Solana in ~2.3 seconds
4. You get a Solana transaction signature as proof
5. 0.5% fee is deducted; recipient gets the rest

**Stats tracked:** Total payments sent, total volume in USDG, fees earned, average settlement time, pending vs completed count.

**Who uses it:** Startups paying remote developers, DAOs paying contributors, companies replacing expensive payroll processors.

---

### 🌍 2. RemitDirect — Cross-Border Remittances
**Route:** `/remittance` &nbsp;·&nbsp; **Fee:** 0.75%

RemitDirect is a direct competitor to Western Union, Wise, and hawala networks. Send money from UAE, US, UK, Singapore, Canada, or Australia to India — delivered in INR via UPI in under 2 seconds, for 0.75%.

**How a remittance works:**
1. Select your sending country (UAE 🇦🇪, US 🇺🇸, UK 🇬🇧, SG 🇸🇬, CA 🇨🇦, AU 🇦🇺)
2. Enter recipient name, UPI ID, and USDG amount
3. INR equivalent is shown automatically
4. Send — Solana settles it, recipient paid to their UPI
5. Active corridors are tracked with live volume data

**The math:** Western Union charges 3–8% on UAE→India transfers. On a $500 remittance, you pay $15–40 in fees. RemitDirect charges 0.75% — that's $3.75. Same money, same destination, 95% cheaper, 1000x faster.

---

### 🔒 3. EscrowX — Smart Contract Escrow
**Route:** `/escrow` &nbsp;·&nbsp; **Fee:** 0.5%

EscrowX is trustless escrow for freelancers and clients. Funds are locked in a Solana smart contract and only released when milestones are completed — no trust required from either side.

**How escrow works:**
1. Client creates an escrow: project name, description, amount, number of milestones
2. Funds lock into a Solana contract — you get the on-chain contract address to verify
3. As milestones complete, funds release progressively
4. If something goes wrong, either party raises a dispute — payment pauses instantly
5. Release or dispute with a single click in the UI

**Escrow states:** `active` → `released` → `completed` (or `disputed` if flagged)

**Why this matters:** Freelancers get burned delivering work and not getting paid. Clients get burned paying deposits and getting ghosted. EscrowX makes both impossible — the Solana contract enforces the deal, not a handshake.

---

### 🎨 4. CreatorPay — Digital Product Commerce
**Route:** `/creator` &nbsp;·&nbsp; **Fee:** 2%

CreatorPay lets anyone sell digital products — courses, ebooks, templates, newsletters, memberships — to a global audience and get paid in USDG instantly. No chargebacks. No 30-day payment holds. No Stripe disputes. Buyer pays, creator receives 98% in seconds.

**How selling works:**
1. List your product: title, description, type, price in USDG
2. It appears in the marketplace immediately
3. Buyer clicks purchase — they enter their name and email
4. USDG transfers on Solana — both sides get a transaction signature as receipt
5. Creator sees real-time sales history and revenue stats

**Product types:** Course · eBook · Template · Newsletter · Membership

**Why it's better than alternatives:**
- Gumroad charges 10%
- Stripe takes 2.9% + $0.30 and can reverse payments up to 120 days later
- CreatorPay charges 2%, never reverses, settles in seconds, global by default

---

### 🤖 5. AgentBank — AI Agent Wallets
**Route:** `/agents` &nbsp;·&nbsp; **Fee:** 1%

AgentBank is infrastructure for the autonomous economy. AI agents need to pay for services, APIs, and compute without human approval on every transaction. AgentBank gives each AI agent its own Solana wallet and supports the **x402 payment-gating protocol**.

**How it works:**
1. Deploy an agent: name, description, owner, toggle x402 on/off
2. Agent gets its own Solana wallet address
3. Fund the wallet with USDG
4. Agent executes payments autonomously — to APIs, services, or other agents
5. All transactions logged with purpose, amount, recipient, and settlement time (<500ms)

**What is x402?** It's an emerging protocol where an HTTP server responds with `402 Payment Required` and an AI agent with a funded wallet pays automatically and retries — no human in the loop. AgentBank is built for this.

**Who uses it:** Developers building AI pipelines that pay for compute, data APIs, or agent-to-agent services programmatically.

---

## 🏗️ Architecture

FlowPay is a pnpm monorepo — two deployable services that talk to each other:

```
FlowPay/
├── artifacts/
│   ├── api-server/      ← Express 5 REST API  →  Replit (always-on)
│   └── flowpay/         ← React + Vite SPA    →  Vercel (global CDN)
├── lib/
│   ├── api-spec/        ← OpenAPI 3.1 spec (50+ endpoints)
│   ├── api-zod/         ← Auto-generated Zod schemas + React Query hooks
│   └── db/              ← Drizzle ORM schema + PostgreSQL migrations
```

**How frontend and backend connect in production:**
- Vercel serves the static React app
- `vercel.json` proxies all `/api/*` requests to the Replit production API
- No CORS issues — the proxy is server-side at Vercel's edge
- Frontend code never hardcodes the API URL — all calls use relative `/api/` paths

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
| State | Zustand |
| API calls | TanStack Query + custom `apiFetch` utility |
| Backend | Express 5 |
| ORM | Drizzle + PostgreSQL |
| Validation | Zod |
| Logging | Pino (structured JSON logs) |
| Auth | Solana wallet public key + Base64 Bearer token |
| Deployment | Vercel (frontend) + Replit autoscale (API) |

### Design Language

The UI is built around a **fintech command-center aesthetic**:
- Pure black (`#070707`) background throughout the app
- Neon green (`#00ff88`) for live indicators, balances, and success states
- Purple particle canvas animation on the landing page (interactive — particles react to your cursor)
- Each module has its own accent color: blue (PayRails), purple (RemitDirect), yellow (EscrowX), pink (CreatorPay), green (AgentBank)
- No green on the landing page except a single "MAINNET" status dot

---

## 🔐 Auth Deep Dive

Here's exactly what happens when you connect a wallet:

1. You click Connect Wallet → wallet picker modal opens
2. Browser checks for Phantom, Backpack, Solflare — shows which are installed
3. You click a wallet → FlowPay calls `wallet.connect()` via the browser extension API
4. Extension returns your **public key** (your Solana address — 32–44 base58 characters)
5. FlowPay sends `POST /api/auth/wallet` with just the wallet address
6. Backend checks if address exists in the database:
   - **Existing user** → returns a token immediately (200)
   - **New address** → auto-creates account as `user_[first8chars]`, creates wallet record, returns token (201)
7. Token (base64-encoded userId + timestamp) stored in localStorage
8. User lands on `/select` — the module picker

No password. No email. No username prompt. Your wallet is your login.

---

## 🗄️ Database Schema

10 tables, every feature covered:

| Table | What it stores |
|-------|----------------|
| `users` | Wallet address, auto-generated display handle |
| `wallets` | USDG balance, INR balance, total sent/received |
| `wallet_transactions` | Every balance movement with timestamps |
| `payroll_payments` | PayRails tx records, Solana signatures, settlement times |
| `remittances` | RemitDirect transfers, corridors, INR amounts |
| `escrows` | Contract addresses, milestone counts, status |
| `creator_products` | Listings, price, type, sales count |
| `creator_sales` | Purchase records, buyer info, Solana signatures |
| `agents` | Agent registry, wallet address, x402 flag |
| `agent_transactions` | Per-agent payment history with purpose |

---

## 🔌 API Reference

All endpoints prefixed with `/api/`. Full OpenAPI 3.1 spec in `lib/api-spec/`.

### Auth
```
POST /auth/wallet      Connect wallet → get token (creates account if new)
GET  /auth/me          Validate token, get current user
```

### Dashboard
```
GET /dashboard/stats      Total volume, fees, transactions across all modules
GET /dashboard/activity   20 most recent transactions across all modules
```

### PayRails
```
GET  /payroll/payments    List all payroll payments
POST /payroll/payments    Send a new payroll payment
GET  /payroll/stats       Stats: count, volume, fees, settlement time
```

### RemitDirect
```
GET  /remittances         List all remittances
POST /remittances         Send a cross-border remittance
GET  /remittances/stats   Corridor stats, volume breakdown
```

### EscrowX
```
GET   /escrows              List all escrow contracts
POST  /escrows              Create a new escrow
PATCH /escrows/:id/release  Release funds to freelancer
PATCH /escrows/:id/dispute  Flag a dispute
```

### CreatorPay
```
GET  /creator/products              Browse product marketplace
POST /creator/products              List a new product
POST /creator/products/:id/purchase Buy a product
GET  /creator/sales                 Sales history
GET  /creator/stats                 Revenue stats
```

### AgentBank
```
GET  /agents                   List all agents
POST /agents                   Deploy a new agent
POST /agents/:id/fund          Add USDG to agent wallet
POST /agents/:id/pay           Execute autonomous payment
GET  /agents/:id/transactions  Agent payment history
```

### Rates & Health
```
GET /rates    Live exchange rates: USDG → INR, USD, AED, GBP
GET /healthz  API health check
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL

### Setup

```bash
# Clone
git clone https://github.com/jerreenj/FlowPay-SolanaDodo.git
cd FlowPay-SolanaDodo

# Install all workspace dependencies
pnpm install

# Set environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/flowpay
SESSION_SECRET=your-secret-here

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (terminal 1)
pnpm --filter @workspace/api-server run dev

# Start frontend (terminal 2)
pnpm --filter @workspace/flowpay run dev
```

### Development Commands

```bash
pnpm run typecheck                        # Full TypeScript check
pnpm --filter @workspace/api-spec run codegen   # Regenerate Zod schemas from OpenAPI
pnpm --filter @workspace/db run studio    # Open Drizzle Studio (DB browser)
```

---

## 🌐 Deployment

### Frontend → Vercel
Connects automatically via GitHub. `vercel.json` in the root configures:
- Build: `pnpm --filter @workspace/flowpay run build`
- Output: `artifacts/flowpay/dist`
- Rewrites: `/api/*` proxied to `https://Flowpay-Solana.replit.app/api/*`
- SPA fallback: all routes → `/index.html`

### API → Replit
Runs as an autoscale deployment at `https://Flowpay-Solana.replit.app`. The Replit project manages both the API server and PostgreSQL database.

---

## 💰 Revenue Model

FlowPay earns a fee on every transaction — automatically, with no manual invoicing or subscription management.

| Module | Fee | At $1M/mo volume |
|--------|-----|------------------|
| PayRails | 0.5% | $5,000/mo |
| RemitDirect | 0.75% | $7,500/mo |
| EscrowX | 0.5% | $5,000/mo |
| CreatorPay | 2% | $20,000/mo |
| AgentBank | 1% | $10,000/mo |

The platform is profitable from the first transaction. No minimum volume. No infrastructure cost beyond the server. Fee revenue scales linearly with usage.

---

## 🏆 Why FlowPay Wins

**Superteam India × Dodo Payments — Solana Frontier 2025**

| Criterion | FlowPay |
|-----------|---------|
| Real working product | ✅ 5 fully functional modules, not mockups |
| Revenue model | ✅ Fee-based, earns from first transaction |
| India-specific | ✅ UPI, INR, cross-border corridors built in |
| Solana-native | ✅ Every payment gets a Solana transaction signature |
| AI-ready | ✅ AgentBank + x402 for autonomous agent payments |
| Full-stack | ✅ Backend, frontend, database, OpenAPI spec |
| Production-deployed | ✅ Live on Vercel + Replit right now |
| Modern auth | ✅ Wallet-only — no email, no password, no friction |
| Great UX | ✅ Fintech command-center aesthetic, sub-second UI |

---

## 📄 License

MIT © 2025 FlowPay — Built for Superteam India × Dodo Payments Hackathon
