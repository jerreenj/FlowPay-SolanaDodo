import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const remittancesTable = pgTable("remittances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  senderName: text("sender_name").notNull(),
  senderCountry: text("sender_country").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientUpiId: text("recipient_upi_id").notNull(),
  amountUsdg: text("amount_usdg").notNull(),
  feeUsdg: text("fee_usdg").notNull().default("0.00"),
  amountInr: text("amount_inr").notNull().default("0.00"),
  status: text("status").notNull().default("pending"),
  solanaSignature: text("solana_signature"),
  settlementSeconds: text("settlement_seconds"),
  dodoPaymentId: text("dodo_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRemittanceSchema = createInsertSchema(remittancesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRemittance = z.infer<typeof insertRemittanceSchema>;
export type Remittance = typeof remittancesTable.$inferSelect;
