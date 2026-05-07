import { useEffect, useState } from "react";

const CACHE_KEY = "flowpay_fx_v1";
const TTL = 2 * 60 * 60 * 1000; // 2 hours

export interface FxRates {
  INR: number;
  AED: number;
  GBP: number;
  fetchedAt: number | null;
  stale: boolean;
}

const FALLBACK: FxRates = { INR: 83.52, AED: 3.67, GBP: 0.79, fetchedAt: null, stale: true };

export function useExchangeRates() {
  const [rates, setRates] = useState<FxRates>(FALLBACK);
  const [loading, setLoading] = useState(true);

  async function fetchRates(force = false) {
    try {
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { data, ts } = JSON.parse(raw) as { data: Omit<FxRates, "fetchedAt" | "stale">; ts: number };
          if (Date.now() - ts < TTL) {
            setRates({ ...data, fetchedAt: ts, stale: false });
            setLoading(false);
            return;
          }
        }
      }
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json() as { rates: Record<string, number> };
      const data = { INR: json.rates.INR, AED: json.rates.AED, GBP: json.rates.GBP };
      const ts = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts }));
      setRates({ ...data, fetchedAt: ts, stale: false });
    } catch {
      // keep current or fallback
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRates();
    const id = setInterval(() => fetchRates(true), TTL);
    return () => clearInterval(id);
  }, []);

  return { rates, loading };
}

export function fmtUpdated(ts: number | null): string {
  if (!ts) return "using estimate";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}
