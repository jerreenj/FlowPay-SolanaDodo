import { Router, type IRouter } from "express";
import express from "express";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, payrollPaymentsTable, remittancesTable, escrowsTable } from "@workspace/db";
import { dodoWebhookKey } from "../lib/dodo";

const router: IRouter = Router();

function verifySignature(rawBody: Buffer, sigHeader: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const received = sigHeader.startsWith("sha256=") ? sigHeader.slice(7) : sigHeader;
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(received, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

router.post(
  "/webhooks/dodo",
  express.raw({ type: "application/json" }),
  async (req, res): Promise<void> => {
    const rawBody = req.body as Buffer;
    const sigHeader = (
      req.headers["webhook-signature"] ??
      req.headers["x-dodo-signature"] ??
      req.headers["x-webhook-signature"] ??
      ""
    ) as string;

    if (dodoWebhookKey) {
      if (!sigHeader || !verifySignature(rawBody, sigHeader, dodoWebhookKey)) {
        req.log?.warn({ sigHeader }, "Dodo webhook signature verification failed");
        res.status(400).json({ error: "Invalid webhook signature" });
        return;
      }
    } else {
      req.log?.warn("DODO_WEBHOOK_KEY not configured — skipping signature check");
    }

    let event: {
      type: string;
      data?: {
        payload?: { payment_id?: string; subscription_id?: string };
        object?: { id?: string; payment_id?: string };
      };
    };

    try {
      event = JSON.parse(rawBody.toString("utf-8"));
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }

    req.log?.info({ type: event.type }, "Dodo webhook received");

    const paymentId =
      event.data?.payload?.payment_id ??
      event.data?.object?.payment_id ??
      event.data?.object?.id;

    if (event.type === "payment.succeeded" && paymentId) {
      await Promise.allSettled([
        db
          .update(payrollPaymentsTable)
          .set({ status: "completed" })
          .where(eq(payrollPaymentsTable.dodoPaymentId, paymentId)),
        db
          .update(remittancesTable)
          .set({ status: "completed" })
          .where(eq(remittancesTable.dodoPaymentId, paymentId)),
        db
          .update(escrowsTable)
          .set({ status: "active" })
          .where(eq(escrowsTable.dodoPaymentId, paymentId)),
      ]);
      req.log?.info({ paymentId }, "Payment marked completed via Dodo webhook");
    }

    if (event.type === "payment.failed" && paymentId) {
      await Promise.allSettled([
        db
          .update(payrollPaymentsTable)
          .set({ status: "failed" })
          .where(eq(payrollPaymentsTable.dodoPaymentId, paymentId)),
        db
          .update(remittancesTable)
          .set({ status: "failed" })
          .where(eq(remittancesTable.dodoPaymentId, paymentId)),
      ]);
      req.log?.info({ paymentId }, "Payment marked failed via Dodo webhook");
    }

    if (event.type === "subscription.active" && paymentId) {
      await db
        .update(payrollPaymentsTable)
        .set({ status: "completed" })
        .where(eq(payrollPaymentsTable.dodoPaymentId, paymentId));
      req.log?.info({ paymentId }, "Subscription activated via Dodo webhook");
    }

    res.json({ received: true });
  }
);

export default router;
