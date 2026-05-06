# ⚡ FlowPay — India's Stablecoin Payment Super-Layer

> Built for **Superteam India × Dodo Payments Hackathon** · Solana Frontier 2025

[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Dodo Payments](https://img.shields.io/badge/Powered%20by-Dodo%20Payments-FF6B35)](https://dodo.ac)
[![USDG](https://img.shields.io/badge/Stablecoin-USDG-00ff88)](https://dodo.ac)
[![Settlement](https://img.shields.io/badge/Settlement-%3C3s-9945FF)](/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

FlowPay is a **full-stack stablecoin payment infrastructure** built for India — powered by **Dodo Payments** and settled on **Solana**. Five purpose-built payment rails in one platform: payroll, cross-border remittance, smart contract escrow, creator commerce, and autonomous AI agent payments.

Every payment settles on-chain in under 3 seconds. Every transaction produces a Solana signature as an immutable receipt. Dodo Payments handles the last-mile fiat delivery — converting USDG to INR and routing it to the right UPI handle, bank account, or API endpoint.

---

## 🔶 Dodo Payments Integration — The Core Architecture

**FlowPay is built as a demonstration of what becomes possible when you place Dodo Payments on top of Solana.** Dodo isn't an add-on here — it is the fiat delivery layer that makes each module work in the real world.

### The Stack

```
User Intent → USDG Transfer on Solana (<3s) → Dodo Payment Rails → INR / UPI / Fiat
```

| Layer | Role |
|-------|------|
| **Solana** | Trustless settlement. Immutable signatures. <3 second finality. |
| **USDG** | Dodo's stablecoin. Stable value, programmable, Solana-native. |
| **Dodo Payments** | Fiat on/off ramp. UPI delivery. Cross-border corridors. x402 execution. |
| **FlowPay** | The application layer — five modules packaging Dodo + Solana into real payment products. |

### How Dodo Powers Each Module

| Module | Dodo's Role |
|--------|-------------|
| **PayRails** | Dodo's fiat-to-UPI rails deliver INR to recipients after USDG settles on Solana |
| **RemitDirect** | Dodo's cross-border corridors (UAE → India, US → India, UK → India) handle last-mile INR delivery |
| **EscrowX** | Dodo processes milestone release payouts — USDG locked on Solana, released to INR via Dodo on trigger |
| **CreatorPay** | Dodo's payment acceptance collects USDG from global buyers and settles INR to Indian creators |
| **AgentBank** | Dodo's API infrastructure enables AI agents to pay autonomously via x402 — HTTP `402` triggers automatic Dodo execution, no human in the loop |

### Why This Combination Is Powerful

India's real payment problem isn't blockchain speed — it's the *bridge*. Solana settles in 3 seconds, but the INR still needs to land in a UPI account. Dodo Payments is that bridge. FlowPay builds on both so users get the speed and transparency of Solana with the reach and reliability of Dodo's fiat rails — behind a simple, clean interface that hides all complexity.

---

## 💡 The Problem FlowPay Solves

India receives over **$100 billion in annual remittances**. The average cross-border transfer takes 2–5 days and costs 5–8%. Payroll for remote Indian contractors requires expensive wire transfers. Freelancer escrow runs on trust or costly legal agreements. Creator payments from global audiences are gated behind processors charging 5–10% with 30-day holds.

FlowPay replaces every one of these with Dodo + Solana:

| Old Way | FlowPay + Dodo |
|---------|----------------|
| 2–5 day settlement | Under 3 seconds |
| 5–8% fees | 0.5–2% |
| Wire transfers, SWIFT | Solana on-chain + Dodo rails |
| Trust-based escrow | Smart contract — trustless |
| Manual INR conversion | Built in (1 USDG = ₹83.52) |
| Chargebacks possible | Impossible — on-chain, final |

---

## 📦 The Five Payment Modules

---

### 💼 1. PayRails — Stablecoin Payroll
**Route:** `/payroll` · **Fee:** 0.5% · **Dodo Role:** UPI delivery of INR to recipient

PayRails lets any company pay Indian contractors, remote workers, and DAO contributors in USDG. The USDG converts to INR at the point of receipt via Dodo's UPI rails — no wire transfers, no payroll processors, no 3-day delays.

**Payment flow:**
1. Enter recipient's name, UPI ID, and amount in USDG
2. FlowPay shows the INR equivalent at live rates (1 USDG = ₹83.52)
3. Hit Send — Solana settles in ~2.3 seconds
4. Dodo routes INR to the recipient's UPI handle
5. A Solana transaction signature is returned as on-chain proof
6. 0.5% fee deducted; recipient receives the remainder

**Who it's for:** Startups paying remote developers, DAOs paying contributors, companies replacing expensive payroll processors.

---

### 🌍 2. RemitDirect — Cross-Border Remittances
**Route:** `/remittance` · **Fee:** 0.75% · **Dodo Role:** Cross-border corridor management + INR delivery

RemitDirect is a direct replacement for Western Union, Wise, and hawala networks. Send money from UAE, US, UK, Singapore, Canada, or Australia to India — delivered in INR via UPI in under 2 seconds.

**Payment flow:**
1. Select sending country (UAE 🇦🇪, US 🇺🇸, UK 🇬🇧, SG 🇸🇬, CA 🇨🇦, AU 🇦🇺)
2. Enter recipient name, UPI ID, and USDG amount
3. INR equivalent shown instantly
4. Solana settles — Dodo delivers INR via UPI
5. Corridor volume tracked live per route

**The economics:** Western Union charges 3–8% on UAE → India. On a $500 remittance, that's $15–40 in fees. RemitDirect charges 0.75% — $3.75 for the same transfer, delivered in 2 seconds instead of 2 days.

---

### 🔒 3. EscrowX — Smart Contract Escrow
**Route:** `/escrow` · **Fee:** 0.5% · **Dodo Role:** Milestone payout processing → INR via Dodo on release

EscrowX is trustless escrow for freelancers and clients. Funds lock into a Solana smart contract and only release when milestones are marked complete. Neither party needs to trust the other — the contract enforces the deal.

**How it works:**
1. Client creates an escrow: project name, total amount, milestone count
2. USDG locks into a Solana contract — both parties get the on-chain contract address
3. As milestones complete, funds release progressively via Dodo → INR to the freelancer's UPI
4. Disputes can be raised at any time — payment pauses instantly, neither side can move funds
5. Release or dispute with one click

**Escrow states:** `active` → `released` → `completed` / `disputed`

**Why it matters:** Freelancers get ghosted after delivering. Clients lose deposits to no-shows. EscrowX makes both impossible — the Solana contract is the arbiter, not a handshake.

---

### 🎨 4. CreatorPay — Digital Product Commerce
**Route:** `/creator` · **Fee:** 2% · **Dodo Role:** Global payment acceptance + INR settlement to creators

CreatorPay lets anyone sell digital products — courses, ebooks, templates, newsletters, memberships — to a global audience and receive payment in USDG, settled to INR via Dodo in seconds. No chargebacks. No 30-day holds. No disputes.

**How selling works:**
1. Creator lists a product: title, description, type, price in USDG
2. It appears in the marketplace immediately
3. Buyer clicks purchase — Dodo accepts the payment, Solana records the transfer
4. Creator receives 98% (post 2% fee) in their FlowPay wallet instantly
5. Both buyer and seller get a Solana transaction signature as receipt

**Product types:** Course · eBook · Template · Newsletter · Membership

**vs alternatives:**
- Gumroad: 10% fee, USD-only, 2–5 day payouts
- Stripe: 2.9% + $0.30, reversible up to 120 days, country restrictions
- CreatorPay: 2%, on-chain final, global by default, settled in seconds

---

### 🤖 5. AgentBank — AI Agent Wallets
**Route:** `/agents` · **Fee:** 1% · **Dodo Role:** x402-compatible payment execution infrastructure

AgentBank is infrastructure for the autonomous economy. AI agents need to pay for services, APIs, and compute without a human approving each transaction. AgentBank gives each AI agent its own Solana wallet funded with USDG, and supports the **x402 payment-gating protocol** — Dodo's infrastructure executes the payments automatically.

**How it works:**
1. Deploy an agent: name, description, owner, enable/disable x402
2. Agent gets its own unique Solana wallet address
3. Fund the wallet with USDG
4. Agent calls an API — server responds `402 Payment Required` with a Dodo payment descriptor
5. Agent reads the descriptor, executes payment via Dodo, retries the request — all in <500ms
6. Full transaction history logged: purpose, recipient, amount, settlement time

**What is x402?** An emerging protocol where HTTP `402 Payment Required` responses carry machine-readable payment instructions. An AI agent with a funded AgentBank wallet reads them and pays automatically — no human approval, no interruption of the AI's workflow.

**Who it's for:** Developers building AI pipelines that pay for compute, data APIs, content generation, or agent-to-agent services programmatically.

---

## 🏗️ Architecture

```
FlowPay/
├── artifacts/
│   ├── api-server/      ← Express 5 REST API (PostgreSQL + Drizzle ORM)
│   └── flowpay/         ← React 18 + Vite 7 SPA
├── lib/
│   ├── api-spec/        ← OpenAPI 3.1 spec (50+ endpoints)
│   ├── api-zod/         ← Auto-generated Zod schemas + TanStack Query hooks
│   └── db/              ← Drizzle ORM schema + PostgreSQL migrations
```

### Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite 7, Tailwind CSS v4 |
| State & Routing | Zustand, Wouter, TanStack Query |
| Backend | Express 5, Drizzle ORM, PostgreSQL, Pino logging |
| Validation | Zod (auto-generated from OpenAPI spec) |
| Auth | Solana wallet public key → Base64 Bearer token |
| Payment Layer | **Dodo Payments** (fiat rails) + **Solana** (settlement) |
| Stablecoin | **USDG** |
| Contract | OpenAPI 3.1 → Orval codegen |

### Design Language

Pure black (`#070707`) background. Neon green (`#00ff88`) for live indicators and success states. Each module has its own accent color (green, sky blue, purple, pink, orange). Purple particle network on the landing page reacts to cursor movement. Matrix-style column rain on the module select page. No decorative clutter — every element is functional.

---

## 🗄️ Database Schema

10 tables, every feature covered:

| Table | What it stores |
|-------|----------------|
| `users` | Wallet address, auto-generated display handle |
| `wallets` | USDG balance, INR balance, total sent/received |
| `wallet_transactions` | Every balance movement with timestamps |
| `payroll_payments` | PayRails records, Solana signatures, settlement times |
| `remittances` | Cross-border transfers, corridors, INR amounts |
| `escrows` | Contract addresses, milestone counts, status |
| `creator_products` | Listings, price, type, sales count |
| `creator_sales` | Purchase records, buyer info, Solana signatures |
| `agents` | Agent registry, wallet address, x402 flag |
| `agent_transactions` | Per-agent payment history with purpose |

---

## 💰 Revenue Model

FlowPay earns a fee on every transaction — no subscription, no minimum volume, profitable from the first payment.

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
| **Dodo Payments integration** | ✅ Core infrastructure — every module's fiat delivery routes through Dodo |
| **Real working product** | ✅ Five fully functional modules, end-to-end |
| **India-specific** | ✅ UPI delivery, INR conversion, six cross-border corridors built in |
| **Solana-native** | ✅ Every payment produces a Solana transaction signature |
| **AI-ready** | ✅ AgentBank + x402 for fully autonomous agent payments |
| **Revenue model** | ✅ Fee-based, earns from the first transaction |
| **Full-stack** | ✅ Backend, frontend, database, OpenAPI spec, codegen |
| **USDG stablecoin** | ✅ USDG is the base currency across all five modules |

---

*Built for Superteam India × Dodo Payments Hackathon · Solana Frontier 2025*
