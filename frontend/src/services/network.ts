import { api } from "./api";
import type { Region, Site, SiteTopology } from "../types/topology";

/**
 * GET /api/region
 */
export async function getRegions(): Promise<Region[]> {
  const { data } = await api.get<Region[]>("/api/region");
  return data;
}

/**
 * GET /api/region/:code/site
 */
export async function getSitesByRegion(code: string): Promise<Site[]> {
  const safe = encodeURIComponent(code);
  const { data } = await api.get<Site[]>(`/api/region/${safe}/site`);
  return data;
}

export async function getPublishedSitesByRegion(code: string): Promise<Site[]> {
  const safe = encodeURIComponent(code);
  const { data } = await api.get<Site[]>(`/api/region/${safe}/published-site`);
  return data;
}

/**
 * GET /api/site/:siteCode/topology
 * returns: { site, staticPaths, connections, services }
 */
export async function getSiteTopology(siteCode: string): Promise<SiteTopology> {
  const safe = encodeURIComponent(siteCode);
  const { data } = await api.get<SiteTopology>(`/api/site/${safe}/topology`);
  return data;
}

export async function getPublishedTopologyPayload(siteCode: string) {
  const safe = encodeURIComponent(siteCode);
  const { data } = await api.get<{
    topology: unknown;
    meta: unknown;
    updatedAt: string | null;
  }>(`/api/site/${safe}/topology/published`);
  return data;
}

export type SiteSummary = {
  id: number;
  code: string;
  name: string;
  regionCode: string;
  regionName: string;
};

export async function listPublishedSiteSummaries(): Promise<SiteSummary[]> {
  const regions = await getRegions();
  const result: SiteSummary[] = [];
  for (const region of regions) {
    const sites = await getPublishedSitesByRegion(region.code);
    sites.forEach((site) => {
      result.push({
        id: site.id,
        code: site.code,
        name: site.name,
        regionCode: region.code,
        regionName: region.name,
      });
    });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
