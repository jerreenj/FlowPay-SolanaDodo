# ⚡ FlowPay — India's Stablecoin Payment Super-Layer

> Built for **Superteam India × Dodo Payments Hackathon** · Solana Frontier

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![USDG](https://img.shields.io/badge/Stablecoin-USDG-00ff88)](https://dodo.ac)
[![Settlement](https://img.shields.io/badge/Settlement-%3C3s-00ff88)](/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

FlowPay is a full-stack stablecoin payment infrastructure layer for India, combining **5 payment modules** into a single platform — all settled on Solana in under 3 seconds using USDG.

---

## 🚀 Live Demo

- **App**: https://flowpay-solanadodo.vercel.app
- **Demo login**: `demo@flowpay.in` / `demo123`

---

## 📦 5 Payment Modules

| Module | Description | Fee |
|--------|-------------|-----|
| **PayRails** | Stablecoin payroll for remote teams — pay Indian contractors from anywhere | 0.5% |
| **RemitDirect** | Cross-border remittances → India. Dubai→Mumbai in 2 seconds via USDG | 0.75% |
| **EscrowX** | Smart contract escrow on Solana. Trustless milestone releases for freelancers | 0.5% |
| **CreatorPay** | Sell digital products (courses, ebooks, templates) globally in USDG — no chargebacks | 2% |
| **AgentBank** | Autonomous AI agent wallets on Solana. x402 protocol for machine-to-machine payments | 1% |

---

## 🏗️ Architecture

```
FlowPay/
├── artifacts/
│   ├── api-server/          # Express 5 API backend
│   └── flowpay/             # React + Vite frontend
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 spec (50+ endpoints)
│   ├── api-zod/             # Generated Zod schemas + React Query hooks
│   └── db/                  # Drizzle ORM + PostgreSQL schema
└── scripts/                 # Shared utility scripts
```

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite 7
- Wouter (routing)
- Zustand (auth state)
- TanStack Query (data fetching)
- Tailwind CSS v4
- Lucide React icons

**Backend**
- Express 5
- Drizzle ORM
- PostgreSQL
- Pino (structured logging)
- Zod (validation)

**Blockchain**
- Solana Mainnet
- USDG Stablecoin (Dodo Payments)
- x402 protocol (AI agent payments)

---

## ⚡ Key Features

### PayRails (Payroll)
- Send USDG payroll to any Indian contractor
- Instant INR conversion (1 USDG = ₹83.52)
- UPI delivery support
- Solana transaction signature per payment
- Settlement in ~2.3 seconds
- **0.5% platform fee**

### RemitDirect (Remittance)
- Cross-border corridors: UAE 🇦🇪, US 🇺🇸, UK 🇬🇧, SG 🇸🇬 → India 🇮🇳
- UPI-based INR delivery
- 60x cheaper than SWIFT/Western Union
- **0.75% platform fee**

### EscrowX (Smart Contract Escrow)
- On-chain escrow contract address per project
- Milestone-based progressive releases
- One-click dispute mechanism
- Trustless — no intermediary
- **0.5% platform fee**

### CreatorPay (Creator Commerce)
- List courses, ebooks, templates, newsletters
- Global USDG payments, instant settlement
- No chargebacks (crypto-native)
- Creator receives 98% — 2% to platform

### AgentBank (AI Agent Payments)
- Deploy autonomous wallets for AI agents
- x402 HTTP payment-gating protocol support
- Machine-to-machine micropayments in <500ms
- Fund agents, track autonomous spending
- **1% platform fee**

---

## 💰 Revenue Model

FlowPay generates revenue on every transaction:

| Module | Volume Example | Fee % | Revenue |
|--------|---------------|-------|---------|
| PayRails | $50,000/mo payroll | 0.5% | $250/mo |
| RemitDirect | $200,000/mo remittances | 0.75% | $1,500/mo |
| EscrowX | $100,000/mo in escrow | 0.5% | $500/mo |
| CreatorPay | $20,000/mo sales | 2% | $400/mo |
| AgentBank | $30,000/mo agent ops | 1% | $300/mo |

**Target**: $3,000/mo at early scale → $30,000+/mo at 200 active users.

---

## 🗄️ Database Schema

```
users              — User accounts + Solana wallet addresses
wallets            — USDG + INR balances
wallet_transactions — All wallet movements
payroll_payments   — PayRails transactions
remittances        — RemitDirect cross-border transfers
escrows            — EscrowX smart contracts + milestones
creator_products   — CreatorPay product listings
creator_sales      — Purchase records
agents             — AgentBank agent registry
agent_transactions — Agent payment history
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api/`:

### Auth
```
POST /auth/register    Create account (generates Solana wallet)
POST /auth/login       Login → returns Bearer token
GET  /auth/me          Get current user
```

### Dashboard
```
GET /dashboard/stats    Aggregate volume + fee stats
GET /dashboard/activity Live activity feed (20 recent tx)
```

### PayRails
```
GET  /payroll/payments      List all payments
POST /payroll/payments      Send payroll payment
GET  /payroll/payments/:id  Get payment details
GET  /payroll/stats         Stats + settlement times
```

### RemitDirect
```
GET  /remittances       List all remittances
POST /remittances       Send remittance
GET  /remittances/:id   Get remittance details
GET  /remittances/stats Corridor stats
```

### EscrowX
```
GET   /escrows              List all escrows
POST  /escrows              Create escrow contract
GET   /escrows/:id          Get escrow details
PATCH /escrows/:id/release  Release funds to freelancer
PATCH /escrows/:id/dispute  Raise a dispute
```

### CreatorPay
```
GET  /creator/products              List products
POST /creator/products              List new product
GET  /creator/products/:id          Get product
POST /creator/products/:id/purchase Buy product (USDG)
GET  /creator/sales                 Sales history
GET  /creator/stats                 Revenue stats
```

### AgentBank
```
GET  /agents                    List all agents
POST /agents                    Deploy new agent
GET  /agents/:id                Get agent details
POST /agents/:id/fund           Fund agent wallet
POST /agents/:id/pay            Execute autonomous payment
GET  /agents/:id/transactions   Agent tx history
```

### Rates
```
GET /rates    Live exchange rates (USDG → INR, USD, AED, GBP)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Setup

```bash
# Clone the repo
git clone https://github.com/jerreenj/FlowPay-SolanaDodo.git
cd FlowPay-SolanaDodo

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and SESSION_SECRET

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port auto-assigned)
pnpm --filter @workspace/flowpay run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/flowpay
SESSION_SECRET=your-secret-here
PORT=8080
```

---

## 🛠️ Development

```bash
# Run codegen after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Typecheck everything
pnpm run typecheck

# DB studio (Drizzle)
pnpm --filter @workspace/db run studio
```

---

## 🔐 Security

- Bearer token auth (userId + timestamp, base64)
- Zod validation on all API inputs
- CORS configured for production domain
- Environment secrets managed outside codebase

---

## 🌐 Deployment

### Vercel (Frontend)
```bash
vercel --cwd artifacts/flowpay
```

### Render / Railway (API)
Set `PORT`, `DATABASE_URL`, `SESSION_SECRET` env vars and deploy `artifacts/api-server`.

---

## 🏆 Hackathon Context

**Event**: Superteam India × Dodo Payments · Solana Frontier  
**Track**: DeFi / Payments Infrastructure  
**Goal**: Zero build cost, Solana mainnet-ready, revenue-generating, 200+ early user target

**Why FlowPay wins:**
- ✅ Real product — 5 fully functional payment modules
- ✅ Revenue model — fee-based, profitable from day 1
- ✅ India-specific — UPI, INR, cross-border corridors
- ✅ AI-native — AgentBank with x402 for the autonomous economy
- ✅ Full-stack — complete backend, frontend, database, OpenAPI spec
- ✅ Production-ready — deployed on Vercel + PostgreSQL

---

## 📄 License

MIT © 2025 FlowPay · Built for Superteam India × Dodo Payments Hackathon
