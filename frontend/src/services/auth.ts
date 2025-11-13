// src/services/auth.ts

export type RegisterInput = {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  role?: UserRole;
};

export type UserRole =
  | "guest"
  | "user"
  | "site_admin"
  | "admin"
  | "super_admin";

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    role: UserRole;
    mustChangePassword?: boolean;
  };
};

export type MeUser = LoginResponse["user"];

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:5266";

// ---------- Local storage helpers ----------
const TOKEN_KEY = "cnfm_token";
const USER_KEY = "cnfm_user";

export function saveAuth(token: string, user: MeUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cnfm-auth-changed"));
}

export function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function loadUser(): MeUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MeUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("cnfm-auth-changed"));
}

// ---------- Authenticated fetch ----------
export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const url =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : `${API_BASE}${input.startsWith("/") ? "" : "/"}${input}`;

  const headers = new Headers(init.headers || {});
  const token = loadToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && needsJson(init)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...init, headers });
}

function needsJson(init: RequestInit) {
  const method = (init.method || "GET").toUpperCase();
  return method === "POST" || method === "PUT" || method === "PATCH";
}

// ---------- API: login / register ----------
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.message || "Login failed.");
  }
  return (await res.json()) as LoginResponse;
}

export async function register(input: RegisterInput): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.message || "Registration failed.");
  }
  return (await res.json()) as LoginResponse;
}

// ---------- API: verify token (/me) ----------
export async function getMe(): Promise<MeUser | null> {
  try {
    const res = await authFetch("/api/auth/me");
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: MeUser };
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<LoginResponse> {
  const res = await authFetch("/api/auth/password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.message || "Unable to update password.");
  }
  return (await res.json()) as LoginResponse;
}

export async function updateProfile(input: {
  firstname?: string;
  lastname?: string;
  username: string;
}): Promise<LoginResponse> {
  const res = await authFetch("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.message || "Unable to update profile.");
  }
  return (await res.json()) as LoginResponse;
}

// ---------- Utils ----------
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
