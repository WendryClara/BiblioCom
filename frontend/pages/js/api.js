const BASE_URL = "http://200.133.17.234:5000";   // ou http://172.16.36.31:5000

export async function apiGet(path) {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}
