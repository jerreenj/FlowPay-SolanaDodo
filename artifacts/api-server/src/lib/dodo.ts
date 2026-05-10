import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_API_KEY ?? "";
export const dodoWebhookKey = process.env.DODO_WEBHOOK_KEY ?? null;
const dodoEnvironment = process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";

export const dodo = new DodoPayments({
  bearerToken: apiKey || "not_configured",
  webhookKey: dodoWebhookKey ?? undefined,
  environment: dodoEnvironment,
});

export const dodoEnabled = Boolean(apiKey);

const rawReturnUrlBase =
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

export const DODO_RETURN_URL_BASE = rawReturnUrlBase.replace(/\/$/, "");

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
