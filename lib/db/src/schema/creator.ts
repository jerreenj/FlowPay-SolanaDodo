import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creatorProductsTable = pgTable("creator_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  creatorName: text("creator_name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("course"),
  priceUsdg: text("price_usdg").notNull(),
  salesCount: integer("sales_count").notNull().default(0),
  totalRevenue: text("total_revenue").notNull().default("0.00"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const creatorSalesTable = pgTable("creator_sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productTitle: text("product_title").notNull(),
  creatorName: text("creator_name").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  amountUsdg: text("amount_usdg").notNull(),
  feeUsdg: text("fee_usdg").notNull().default("0.00"),
  creatorReceives: text("creator_receives").notNull(),
  solanaSignature: text("solana_signature"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCreatorProductSchema = createInsertSchema(creatorProductsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCreatorProduct = z.infer<typeof insertCreatorProductSchema>;
export type CreatorProduct = typeof creatorProductsTable.$inferSelect;
export type CreatorSale = typeof creatorSalesTable.$inferSelect;
