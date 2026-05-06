# FlowPay — India's Stablecoin Payment Super-Layer

Built for **Superteam India × Dodo Payments Hackathon** on Solana Frontier.

## Run & Operate

| Command | Purpose |
|---------|---------|
| `pnpm --filter @workspace/api-server run dev` | Start API server (port 8080) |
| `pnpm --filter @workspace/flowpay run dev` | Start React frontend |
| `pnpm --filter @workspace/db run push` | Push DB schema changes |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate Zod schemas + hooks |
| `pnpm run typecheck` | Full typecheck (libs then leaves) |

**Required secrets**: `DATABASE_URL`, `SESSION_SECRET`, `DODO_API_KEY`

**Demo login**: `demo@flowpay.in` / `demo123`

## Stack

- **Frontend**: React 18, Vite 7, Wouter, Zustand (auth), TanStack Query, Tailwind CSS v4
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, Pino logging
- **Auth**: Base64 token (userId + timestamp), localStorage, `Authorization: Bearer`
- **Theme**: `#070707` background, neon green `#00ff88` + per-module accents

## Where Things Live

```
artifacts/api-server/src/routes/   — Express route handlers (one file per module)
artifacts/flowpay/src/pages/       — React pages (one per module + Buy.tsx public checkout)
artifacts/flowpay/src/components/  — AppLayout, Sidebar, WalletConnect, RainingLetters
lib/api-spec/                      — OpenAPI 3.1 spec (source of truth)
lib/api-zod/src/generated/         — Generated Zod schemas + React Query hooks
lib/db/src/schema.ts               — Drizzle ORM schema (source of truth)
```

## Architecture Decisions

- **No auth middleware on API** — routes are individually responsible; creator/dashboard endpoints are fully public to support the `/buy/:id` share page without login
- **Mock Solana signatures** — 88-char Base58 strings, realistic but not real on-chain txns
- **Settlement simulation** — `setTimeout(1500–3000ms)` per payment to mimic real Solana finality for demo
- **USDG = $1** — exchange rates hardcoded: 1 USDG = 83.52 INR, 3.67 AED, 0.79 GBP (live-ish via `/api/rates`)
- **Monorepo code-gen contract** — frontend never imports directly from backend; all types flow through `lib/api-zod`
- **Dodo Payments integration** — All 5 modules create real Dodo products + checkout sessions (real `cks_…` IDs + `https://test.checkout.dodopayments.com/session/…` URLs stored in DB and shown in UI). PayRails: product+session per payment. RemitDirect: product+session per remittance. EscrowX: product+session on contract creation. CreatorPay: product on listing, session on purchase. AgentBank: product+session on fund. Currency must be uppercase `"USD"`. Return URLs must be absolute HTTPS. Dodo SDK: `dodopayments@2.31.0`. Module: `artifacts/api-server/src/lib/dodo.ts`.
- **Sidebar order**: Profile → PayRails → RemitDirect → EscrowX → CreatorPay → AgentBank → Wallet

## Product

**5 Payment Modules** (all on Solana, all USDG):

| Module | Route | Accent | Fee | Key feature |
|--------|-------|--------|-----|-------------|
| PayRails | `/payroll` | `#00ff88` | 0.5% | Stablecoin payroll → UPI delivery |
| RemitDirect | `/remittance` | `#38bdf8` | 0.75% | Cross-border UAE/US/UK → India |
| EscrowX | `/escrow` | `#a78bfa` | 0.5% | Smart-contract milestone escrow |
| CreatorPay | `/creator` | `#f472b6` | 2% | Sell digital products; share link `/buy/:id` |
| AgentBank | `/agents` | `#fb923c` | 1% | AI agent wallets, x402 protocol |

**Public pages** (no login needed):
- `/buy/:id` — shareable product checkout for CreatorPay

## User Preferences

- Dark fintech command-center aesthetic — pure black bg, neon accent per module
- All 5 modules have consistent header layout: icon + title + fee badge + subtitle + CTA button
- Subtitle text at `rgba(255,255,255,0.56)` for visibility on smaller laptop screens
- Stats cards use `clamp()` font sizes for responsive scaling
- Sidebar accent color shifts to match active module

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change, then fix `lib/api-zod/src/index.ts` to `export * from "./generated/api";`
- `pnpm dev` at workspace root is intentionally absent — use workflows or `--filter`
- The `/buy/:id` page is NOT a protected route — keep it that way so share links work publicly
- After DB schema push to prod, check Drizzle Studio for migration state

## Pointers

- `.local/skills/pnpm-workspace/` — monorepo conventions
- `.local/skills/database/` — prod DB queries and migration guidance
- GitHub repo: `jerreenj/FlowPay-SolanaDodo` (branch: `main`)
- Vercel: rewrites `/api/:path*` → `https://Flowpay-Solana.replit.app/api/:path*`
