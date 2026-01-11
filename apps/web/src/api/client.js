export async function apiGet(path) {
  const r = await fetch(`/api${path}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Error API");
  return data;
}

// src/api/client.js (o donde lo tengas)
export async function apiPost(path, body) {
  const r = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "Error API");
  return data;
}
