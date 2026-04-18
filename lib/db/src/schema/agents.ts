import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agentsTable = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ownerName: text("owner_name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  usdgBalance: text("usdg_balance").notNull().default("0.00"),
  totalPaid: text("total_paid").notNull().default("0.00"),
  totalReceived: text("total_received").notNull().default("0.00"),
  transactionCount: integer("transaction_count").notNull().default(0),
  isActive: text("is_active").notNull().default("true"),
  x402Enabled: text("x402_enabled").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const agentTransactionsTable = pgTable("agent_transactions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  type: text("type").notNull(),
  recipientName: text("recipient_name"),
  recipientAddress: text("recipient_address"),
  amountUsdg: text("amount_usdg").notNull(),
  purpose: text("purpose").notNull(),
  solanaSignature: text("solana_signature"),
  settlementMs: text("settlement_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;
export type AgentTransaction = typeof agentTransactionsTable.$inferSelect;
