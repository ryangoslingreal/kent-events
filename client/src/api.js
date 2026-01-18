const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}