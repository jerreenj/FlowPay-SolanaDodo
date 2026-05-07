import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_API_KEY ?? "";
export const dodoWebhookKey = process.env.DODO_WEBHOOK_KEY ?? null;

export const dodo = new DodoPayments({
  bearerToken: apiKey || undefined,
  webhookKey: dodoWebhookKey ?? undefined,
  environment: "test_mode",
});

export const dodoEnabled = Boolean(apiKey);

export const DODO_RETURN_URL_BASE = "https://flowpay.replit.app";

/**
 * Creates a persistent Dodo customer record and returns the customer_id.
 * Falls back to null if Dodo is disabled or creation fails.
 */
export async function createDodoCustomer(name: string, email: string): Promise<string | null> {
  if (!dodoEnabled) return null;
  try {
    const customer = await dodo.customers.create({ name, email });
    return customer.customer_id;
  } catch {
    return null;
  }
}
