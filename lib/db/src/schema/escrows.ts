import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const escrowsTable = pgTable("escrows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  freelancerName: text("freelancer_name").notNull(),
  freelancerEmail: text("freelancer_email").notNull(),
  projectTitle: text("project_title").notNull(),
  description: text("description").notNull(),
  amountUsdg: text("amount_usdg").notNull(),
  feeUsdg: text("fee_usdg").notNull().default("0.00"),
  milestones: integer("milestones").notNull().default(1),
  completedMilestones: integer("completed_milestones").notNull().default(0),
  status: text("status").notNull().default("active"),
  solanaAddress: text("solana_address"),
  solanaSignature: text("solana_signature"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEscrowSchema = createInsertSchema(escrowsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEscrow = z.infer<typeof insertEscrowSchema>;
export type Escrow = typeof escrowsTable.$inferSelect;
