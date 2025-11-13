import { authFetch } from "./auth";
import type { UserRole } from "./auth";

export type UserStatus = "active" | "inactive";

export type SiteAssignment = {
  siteId: number;
  code: string;
  name: string;
  regionCode?: string;
  regionName?: string;
  isPrimary?: boolean;
};

export type AdminUserRecord = {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  assignedSites: SiteAssignment[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSiteAdminInput = {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  siteIds: number[];
  mustChangePassword?: boolean;
};

async function parseResponse(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const res = await authFetch("/api/admin/users");
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data?.message || "Unable to load admin users.");
  }
  const payload = await parseResponse(res);
  if (Array.isArray(payload)) return payload as AdminUserRecord[];
  if (Array.isArray(payload?.users)) {
    return payload.users as AdminUserRecord[];
  }
  return [];
}

export async function createSiteAdminUser(
  input: CreateSiteAdminInput
): Promise<AdminUserRecord> {
  const res = await authFetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      role: "site_admin",
      mustChangePassword: input.mustChangePassword ?? true,
    }),
  });
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data?.message || "Failed to create site admin.");
  }
  return (await res.json()) as AdminUserRecord;
}

export async function updateUserAssignments(
  userId: number,
  siteIds: number[]
): Promise<AdminUserRecord> {
  const res = await authFetch(`/api/admin/users/${userId}/sites`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteIds }),
  });
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new Error(data?.message || "Failed to update site assignments.");
  }
  return (await res.json()) as AdminUserRecord;
}
