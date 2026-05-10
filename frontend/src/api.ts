const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "/api";

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ");
    }
    return res.statusText || "Something went wrong";
  } catch {
    return res.statusText || "Something went wrong";
  }
}

export async function signUp(body: {
  username: string;
  email: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await fetch(`${base}/sign_up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function logIn(body: {
  email: string;
  password: string;
}): Promise<{ message: string; user_id: string; access_token: string }> {
  const res = await fetch(`${base}/log_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function sendChat(userId: string, query: string): Promise<{ response: string }> {
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, query }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Clears server-side conversation memory for this user (new chat thread). */
export async function resetChatHistory(userId: string): Promise<void> {
  const res = await fetch(`${base}/chat/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function fetchProfile(
  userId: string
): Promise<{ username?: string; email?: string } | null> {
  const res = await fetch(`${base}/userprofile/${encodeURIComponent(userId)}`);
  if (!res.ok) return null;
  return res.json();
}
