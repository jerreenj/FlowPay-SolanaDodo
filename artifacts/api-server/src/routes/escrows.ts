import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, escrowsTable } from "@workspace/db";
import { CreateEscrowBody, GetEscrowParams, ReleaseEscrowParams, DisputeEscrowParams } from "@workspace/api-zod";

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
