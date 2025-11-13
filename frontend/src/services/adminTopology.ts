import { authFetch } from "./auth";

export type AdminSiteSummary = {
  id: number;
  code: string;
  name: string;
  regionCode: string;
  regionName: string;
};

export async function listAdminSites(): Promise<AdminSiteSummary[]> {
  const res = await authFetch("/api/admin/my-sites");
  if (!res.ok) {
    const message = (await res.json().catch(() => null))?.message;
    throw new Error(message || "Failed to load admin sites.");
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data as AdminSiteSummary[];
  }
  if (Array.isArray(data?.sites)) {
    return data.sites as AdminSiteSummary[];
  }
  return [];
}

export async function fetchTopologyDraft(siteId: number) {
  const res = await authFetch(
    `/api/admin/site/${siteId}/topology/draft`
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("draft_fetch_failed");
  }
  const data = await res.json();
  return data?.draft ?? null;
}

export async function saveTopologyDraft(
  siteId: number,
  topology: unknown,
  meta?: unknown
) {
  const res = await authFetch(
    `/api/admin/site/${siteId}/topology/draft`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topology, meta }),
    }
  );
  if (!res.ok) {
    throw new Error("draft_save_failed");
  }
  return await res.json();
}

export async function publishTopology(
  siteId: number,
  topology: unknown,
  meta?: unknown
) {
  const res = await authFetch(
    `/api/admin/site/${siteId}/topology/publish`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topology, meta }),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "topology_publish_failed");
  }
  return await res.json();
}

export async function fetchPublishedTopology(siteId: number) {
  const res = await authFetch(
    `/api/admin/site/${siteId}/topology/published`
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("published_fetch_failed");
  }
  const data = await res.json();
  return data ?? null;
}

export async function createAdminSite(input: {
  code: string;
  name: string;
  regionCode: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const res = await authFetch("/api/admin/site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "site_create_failed");
  }
  return (await res.json()) as {
    id: number;
    code: string;
    name: string;
    regionCode: string;
  };
}

export type SiteService = {
  id: number;
  siteId: number;
  name: string;
  sortOrder: number;
  createdAt?: string;
};

export async function addSiteService(
  siteId: number,
  input: { name: string; sortOrder?: number }
): Promise<SiteService> {
  const res = await authFetch(`/api/admin/site/${siteId}/service`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "service_create_failed");
  }
  return (await res.json()) as SiteService;
}

export async function updateSiteService(
  siteId: number,
  serviceId: number,
  input: { name?: string; sortOrder?: number }
): Promise<SiteService> {
  const res = await authFetch(
    `/api/admin/site/${siteId}/service/${serviceId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "service_update_failed");
  }
  return (await res.json()) as SiteService;
}

export async function deleteSiteService(
  siteId: number,
  serviceId: number
): Promise<void> {
  const res = await authFetch(
    `/api/admin/site/${siteId}/service/${serviceId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "service_delete_failed");
  }
}

export async function deleteAdminSite(siteId: number): Promise<void> {
  const res = await authFetch(`/api/admin/site/${siteId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "site_delete_failed");
  }
}

export async function listLoadTags(): Promise<string[]> {
  const res = await authFetch("/api/admin/load-tags");
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "load_tags_fetch_failed");
  }
  const payload = await res.json();
  if (Array.isArray(payload)) return payload as string[];
  if (Array.isArray(payload?.tags)) return payload.tags as string[];
  return [];
}
