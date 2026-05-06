import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payrollPaymentsTable = pgTable("payroll_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  senderName: text("sender_name").notNull(),
  senderCompany: text("sender_company").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientUpiId: text("recipient_upi_id"),
  amountUsdg: text("amount_usdg").notNull(),
  feeUsdg: text("fee_usdg").notNull().default("0.00"),
  amountInr: text("amount_inr").notNull().default("0.00"),
  status: text("status").notNull().default("pending"),
  solanaSignature: text("solana_signature"),
  settlementSeconds: text("settlement_seconds"),
  dodoPaymentId: text("dodo_payment_id"),
  dodoCheckoutUrl: text("dodo_checkout_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPayrollPaymentSchema = createInsertSchema(payrollPaymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayrollPayment = z.infer<typeof insertPayrollPaymentSchema>;
export type PayrollPayment = typeof payrollPaymentsTable.$inferSelect;
