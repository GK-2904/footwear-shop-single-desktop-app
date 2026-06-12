/** API base — relative in production (served from same Spring Boot port), absolute in dev */
export const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:8080/api");

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${path}`);
  }
  return res.json();
}
