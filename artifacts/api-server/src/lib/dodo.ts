import DodoPayments from "dodopayments";

const apiKey = process.env.DODO_API_KEY ?? "";

export const dodo = new DodoPayments({
  bearerToken: apiKey || undefined,
  environment: "test_mode",
});

export const dodoEnabled = Boolean(apiKey);

export const DODO_RETURN_URL_BASE = "https://flowpay.replit.app";
