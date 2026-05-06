import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, escrowsTable } from "@workspace/db";
import { CreateEscrowBody, GetEscrowParams, ReleaseEscrowParams, DisputeEscrowParams } from "@workspace/api-zod";
import { dodo, dodoEnabled, DODO_RETURN_URL_BASE } from "../lib/dodo";

const router: IRouter = Router();

function generateSolanaAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generateSolanaSignature(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function calcFee(amount: string): string {
  return (parseFloat(amount) * 0.005).toFixed(4);
}

function mapEscrow(e: typeof escrowsTable.$inferSelect) {
  return {
    id: e.id,
    clientName: e.clientName,
    clientEmail: e.clientEmail,
    freelancerName: e.freelancerName,
    freelancerEmail: e.freelancerEmail,
    projectTitle: e.projectTitle,
    description: e.description,
    amountUsdg: e.amountUsdg,
    feeUsdg: e.feeUsdg,
    milestones: e.milestones,
    completedMilestones: e.completedMilestones,
    status: e.status,
    solanaAddress: e.solanaAddress ?? null,
    solanaSignature: e.solanaSignature ?? null,
    dodoPaymentId: e.dodoPaymentId ?? null,
    dodoCheckoutUrl: e.dodoCheckoutUrl ?? null,
    createdAt: e.createdAt,
  };
}

router.get("/escrows", async (_req, res): Promise<void> => {
  const rows = await db.select().from(escrowsTable).orderBy(sql`created_at DESC`);
  res.json(rows.map(mapEscrow));
});

router.post("/escrows", async (req, res): Promise<void> => {
  const parsed = CreateEscrowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clientName, clientEmail, freelancerName, freelancerEmail, projectTitle, description, amountUsdg, milestones } = parsed.data;
  const feeUsdg = calcFee(amountUsdg);
  const solanaAddress = generateSolanaAddress();
  const solanaSignature = generateSolanaSignature();
  const amountInCents = Math.round(parseFloat(amountUsdg) * 100);

  let dodoPaymentId: string | null = null;
  let dodoCheckoutUrl: string | null = null;

  if (dodoEnabled) {
    try {
      const product = await dodo.products.create({
        name: `EscrowX: ${projectTitle}`,
        description: `Smart contract escrow of $${amountUsdg} USDG. Client: ${clientName}, Freelancer: ${freelancerName}. Milestones: ${milestones ?? 1}`,
        tax_category: "digital_products",
        price: {
          currency: "USD",
          discount: 0,
          price: amountInCents,
          purchasing_power_parity: false,
          type: "one_time_price",
        },
        metadata: {
          client_name: clientName,
          freelancer_name: freelancerName,
          project: projectTitle,
          milestones: String(milestones ?? 1),
          solana_address: solanaAddress,
          source: "flowpay_escrow",
        },
      });
      const session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: product.product_id, quantity: 1 }],
        customer: {
          email: clientEmail,
          name: clientName,
        },
        return_url: `${DODO_RETURN_URL_BASE}/escrow`,
      });
      dodoPaymentId = session.session_id;
      dodoCheckoutUrl = session.checkout_url ?? null;
    } catch (err: unknown) {
      req.log?.warn({ err }, "Dodo escrow session creation failed");
    }
  }

  const [row] = await db.insert(escrowsTable).values({
    clientName,
    clientEmail,
    freelancerName,
    freelancerEmail,
    projectTitle,
    description,
    amountUsdg,
    feeUsdg,
    milestones: milestones ?? 1,
    completedMilestones: 0,
    status: "active",
    solanaAddress,
    solanaSignature,
    dodoPaymentId,
    dodoCheckoutUrl,
  }).returning();

  res.status(201).json(mapEscrow(row));
});

router.get("/escrows/:id", async (req, res): Promise<void> => {
  const params = GetEscrowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.select().from(escrowsTable).where(eq(escrowsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }

  res.json(mapEscrow(row));
});

router.patch("/escrows/:id/release", async (req, res): Promise<void> => {
  const params = ReleaseEscrowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.update(escrowsTable)
    .set({ status: "released", completedMilestones: sql`milestones` })
    .where(eq(escrowsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }

  res.json(mapEscrow(row));
});

router.patch("/escrows/:id/dispute", async (req, res): Promise<void> => {
  const params = DisputeEscrowParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db.update(escrowsTable)
    .set({ status: "disputed" })
    .where(eq(escrowsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }

  res.json(mapEscrow(row));
});

export default router;
