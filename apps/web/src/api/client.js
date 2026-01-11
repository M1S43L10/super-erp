function getERPToken() {
  return localStorage.getItem("erp_token");
}

async function parseResponse(r) {
  const text = await r.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text || "Error API" };
  }
}

function buildHeaders(extra) {
  const token = getERPToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

function handleAuthError(r) {
  // opcional: si te da 401, limpiamos y mandamos al login
  if (r.status === 401) {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    // evita loop si ya estás en /login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
}

export async function apiGet(path) {
  const r = await fetch(`/api${path}`, {
    headers: buildHeaders(),
  });

  const data = await parseResponse(r);

  if (!r.ok) {
    handleAuthError(r);
    throw new Error(data?.error || "Error API");
  }

  return data;
}

export async function apiPost(path, body) {
  const r = await fetch(`/api${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body ?? {}),
  });

  const data = await parseResponse(r);

  if (!r.ok) {
    handleAuthError(r);
    throw new Error(data?.error || "Error API");
  }

  return data;
}
