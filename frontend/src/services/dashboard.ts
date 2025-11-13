import { authFetch } from "./auth";

export type DashboardOverview = {
  metrics: {
    regions: number;
    sites: number;
    links: number;
    services: number;
    publishedSites: number;
    draftsUpdated24h: number;
  };
  regionBreakdown: Array<{
    id: number;
    code: string;
    name: string;
    siteCount: number;
    serviceCount: number;
  }>;
  recentActivity: Array<{
    siteId: number;
    siteCode: string;
    siteName: string;
    updatedAt: string;
    actor: string;
  }>;
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await authFetch("/api/admin/dashboard/overview");
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? data.message
        : null) || "dashboard_overview_failed";
    throw new Error(String(message));
  }
  return data as DashboardOverview;
}
