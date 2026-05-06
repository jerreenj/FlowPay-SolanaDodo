const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = input.startsWith("/api") ? `${API_BASE}${input}` : input;
  return fetch(url, init);
}
