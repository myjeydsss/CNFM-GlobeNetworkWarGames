export type SiteServiceEntry =
  | string
  | {
      id?: number;
      name: string;
      sortOrder?: number;
    };

export function extractServiceNames(
  services?: SiteServiceEntry[]
): string[] {
  if (!Array.isArray(services)) return [];
  return services
    .map((entry) =>
      typeof entry === "string"
        ? entry
        : typeof entry?.name === "string"
        ? entry.name
        : ""
    )
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

// Regions
export type Region = {
  id: number;
  code: string;
  name: string;
};

// Sites (list views)
export type Site = {
  id: number;
  regionId: number;
  code: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Label rectangle (yellow pill) or any rect payload
export type LabelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Topology pieces
export type Segment = {
  path: string;
  description: string | null;
};

export type Connection = {
  key: string;
  displayName: string;
  from: string;
  to: string;
  segments: Segment[];
  load: string[];
  label?: LabelRect; // 👈 from linklabel table when present
  edgeType?: "smoothstep" | "straight" | "step" | "bezier";
  animated?: boolean;
};

// Blue place nodes that come from DB `site` table
export type PlaceNode = {
  code: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Topology payload for a specific site
export type SiteTopology = {
  site: {
    id?: number;
    code: string;
    name: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  staticPaths: string[];
  connections: Connection[];
  services: SiteServiceEntry[];
  placeNodes?: PlaceNode[]; // 👈 TUBOD, PAGADIAN, CDO, DAUIN…
};
