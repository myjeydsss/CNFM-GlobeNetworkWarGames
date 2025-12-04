import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  ReactFlowInstance,
  getRectOfNodes,
} from "reactflow";
import "reactflow/dist/style.css";
import Swal from "sweetalert2";
import { listAdminSites } from "../../services/adminTopology";
import {
  getPublishedTopologyPayload,
  getSiteTopology,
  listPublishedSiteSummaries,
  type SiteSummary,
} from "../../services/network";
import type { SiteTopology, PlaceNode, Connection } from "../../types/topology";
import { extractServiceNames } from "../../types/topology";
import TopologyNode, { type TopologyNodeData } from "./TopologyNode";
import DraggableLabelEdge from "./edges/DraggableLabelEdge";
import "./AdminTopologyViewer.css";
import { loadUser } from "../../services/auth";
import {
  hasSharedLoadTechnology,
  normalizeLoadLabel,
} from "../../utils/loadMatching";
import { resolveInitialTheme, applyThemeVars } from "../../components/Sidebar";

const DEFAULT_EDGE_STYLE = { strokeWidth: 4, stroke: "#2563eb" };
const STRUCTURAL_EDGE_STYLE = {
  strokeWidth: 3,
  stroke: "rgba(148,163,184,.45)",
};

const CORE_STYLE = {
  background: "#1d4ed8",
  color: "#fff",
  borderRadius: 16,
  padding: "12px 20px",
  fontWeight: 700,
  letterSpacing: ".05em",
  boxShadow: "0 12px 30px rgba(37,99,235,.35)",
};

const SECONDARY_STYLE = {
  background: "#0f172a",
  color: "#e2e8f0",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 600,
  letterSpacing: ".05em",
  boxShadow: "0 10px 24px rgba(15,23,42,.35)",
};

const LABEL_STYLE = {
  ...SECONDARY_STYLE,
  background: "#1e293b",
  color: "#e2e8f0",
};

type FlowBundle = {
  nodes: Node[];
  edges: Edge[];
};

type NamedConnection = Connection & {
  fromName: string;
  toName: string;
};

type AltInfo = { isAlternative: boolean; matchingLoad: string[] };
type AltMap = Record<string, AltInfo>;

type HoverState = {
  key: string;
  x: number;
  y: number;
} | null;

type DraftTopologyNode = {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  kind?: string;
};

type DraftTopologyEdge = {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  color?: string;
  structural?: boolean;
  loads?: string[];
  type?: string;
  animated?: boolean;
  labelT?: number;
  labelOffset?: { x?: number; y?: number };
};

type DraftTopologyPayload = {
  nodes?: DraftTopologyNode[];
  edges?: DraftTopologyEdge[];
};

function normalizeHandleId(id?: unknown): string | undefined {
  if (typeof id !== "string") return undefined;
  const match = id.match(/^(s|t)-(top|bottom|left|right)-(\d+)$/);
  if (!match) return undefined;
  const [, prefix, side] = match;
  return `${prefix}-${side}-1`;
}

type HoverCardPayload = {
  displayName: string;
  route: string;
  load: string[];
  isOffline: boolean;
  alternativeFor: Array<{ key: string; name: string; matching: string[] }>;
};

function getHoverDetails(
  key: string,
  connections: Map<string, NamedConnection>,
  offline: Set<string>,
  altLookup: Record<string, AltMap>
): HoverCardPayload | null {
  const conn = connections.get(key);
  if (!conn) return null;
  const isOffline = offline.has(key);
  const alternativeFor: Array<{
    key: string;
    name: string;
    matching: string[];
  }> = [];
  if (!isOffline) {
    for (const [offKey, map] of Object.entries(altLookup)) {
      if (map && map[key]?.isAlternative) {
        const offConn = connections.get(offKey);
        alternativeFor.push({
          key: offKey,
          name: offConn?.displayName || offKey,
          matching: map[key].matchingLoad,
        });
      }
    }
  }
  return {
    displayName: conn.displayName || key,
    route: `${conn.fromName || conn.from} → ${conn.toName || conn.to}`,
    load: conn.load ?? [],
    isOffline,
    alternativeFor,
  };
}

function HoverCard({
  x,
  y,
  data,
  containerRef,
}: {
  x: number;
  y: number;
  data: HoverCardPayload | null;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const el = ref.current;
    const wrap = containerRef.current;
    if (!el || !wrap) return;

    const cardW = el.offsetWidth;
    const cardH = el.offsetHeight;
    const rect = wrap.getBoundingClientRect();

    const left = Math.min(
      Math.max(12, x),
      Math.max(12, rect.width - cardW - 12)
    );
    const top = Math.min(
      Math.max(12, y),
      Math.max(12, rect.height - cardH - 12)
    );
    setPos({ left, top });
  }, [x, y, data, containerRef]);

  if (!data) return null;
  const { displayName, route, load, isOffline, alternativeFor } = data;

  return (
    <div
      ref={ref}
      className={`viewer-hovercard ${isOffline ? "off" : "on"}`}
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="hc-title">{displayName}</div>
      <div className="hc-row">
        <span className="hc-label">Route:</span> {route}
      </div>
      <div className="hc-row">
        <span className="hc-label">Load:</span>
      </div>
      <ul className="hc-list">
        {load.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      {!isOffline && alternativeFor.length > 0 && (
        <div className="hc-alt">
          {alternativeFor.map((alt) => (
            <div key={alt.key} className="hc-row alt">
              <span className="hc-label">Alternative for:</span> {alt.name}{" "}
              <span className="hc-label">Matching:</span>{" "}
              {alt.matching.join(", ")}
            </div>
          ))}
        </div>
      )}
      <div className={`hc-status ${isOffline ? "bad" : "good"}`}>
        {isOffline ? "OFFLINE" : "ONLINE"}
      </div>
    </div>
  );
}

function findAlternatives(
  offlineKey: string,
  connections: Connection[],
  offlineSet: Set<string>
): AltMap {
  const off = connections.find((c) => c.key === offlineKey);
  if (!off) return {};
  const out: AltMap = {};
  for (const conn of connections) {
    if (conn.key === offlineKey) continue;
    if (offlineSet.has(conn.key)) continue;

    const canAlt =
      conn.from === off.from ||
      conn.to === off.to ||
      conn.from === off.to ||
      conn.to === off.from;
    if (!canAlt) continue;

    const matching: string[] = [];
    const seenMatches = new Set<string>();
    for (const a of off.load) {
      const normA = normalizeLoadLabel(a);
      if (!normA) continue;
      for (const b of conn.load) {
        const normB = normalizeLoadLabel(b);
        if (!normB) continue;
        if (normA === normB || hasSharedLoadTechnology(normA, normB)) {
          if (!seenMatches.has(normB)) {
            seenMatches.add(normB);
            matching.push(b);
          }
        }
      }
    }
    if (matching.length) {
      out[conn.key] = { isAlternative: true, matchingLoad: matching };
    }
  }
  return out;
}

function titleFor(key: string, connections: Map<string, NamedConnection>) {
  const conn = connections.get(key);
  if (!conn) return key;
  const from = conn.fromName || conn.from;
  const to = conn.toName || conn.to;
  return `${conn.displayName || key} (${from} → ${to})`;
}

function asNumber(input: unknown, fallback: number): number {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const parsed = Number.parseFloat(input);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function makeNode(
  id: string,
  label: string,
  kind: "core" | "node" | "label",
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  color?: string
): Node {
  const base =
    kind === "core"
      ? CORE_STYLE
      : kind === "label"
      ? LABEL_STYLE
      : SECONDARY_STYLE;
  const style = color ? { ...base, background: color } : base;
  const data: TopologyNodeData = {
    label,
    kind,
    style,
  };
  return {
    id,
    type: "topology",
    data,
    position: {
      x: typeof x === "number" ? x : 0,
      y: typeof y === "number" ? y : 0,
    },
    width: typeof width === "number" ? width : 190,
    height: typeof height === "number" ? height : 80,
    style: {
      width: typeof width === "number" ? width : 190,
      height: typeof height === "number" ? height : 80,
    },
  };
}

function buildFlowFromLive(topology: SiteTopology): FlowBundle {
  const nodes: Node[] = [];
  const placeMap = new Map<string, PlaceNode>();
  topology.placeNodes?.forEach((pn) => placeMap.set(pn.code, pn));
  const nameMap = new Map<string, string>();

  const main = topology.site;
  nameMap.set(main.code, main.name || main.code);
  nodes.push(
    makeNode(
      main.code,
      main.name || main.code,
      "core",
      Number(main.x ?? 0),
      Number(main.y ?? 0),
      Number(main.width ?? 190),
      Number(main.height ?? 80)
    )
  );

  placeMap.forEach((pn) => {
    nameMap.set(pn.code, pn.name || pn.code);
    nodes.push(
      makeNode(
        pn.code,
        pn.name || pn.code,
        "node",
        Number(pn.x ?? 0),
        Number(pn.y ?? 0),
        Number(pn.width ?? 190),
        Number(pn.height ?? 80)
      )
    );
  });

  const edges: Edge[] = topology.connections.map((conn, idx) => {
    const structural = !(conn.load && conn.load.length);
    const allowedTypes: Array<Edge["type"]> = [
      "smoothstep",
      "straight",
      "step",
      "bezier",
    ];
    const edgeType =
      typeof (conn as any)?.edgeType === "string" &&
      allowedTypes.includes((conn as any).edgeType)
        ? (conn as any).edgeType
        : "smoothstep";
    const animated =
      !!(conn as any)?.animated && !structural
        ? true
        : !structural && edgeType !== "straight";

    return {
      id: conn.key || `edge-${idx}`,
      source: conn.from || topology.site.code,
      target: conn.to || topology.site.code,
      label: conn.displayName || conn.key || "",
      type: "labelled",
      animated,
      style: structural ? STRUCTURAL_EDGE_STYLE : DEFAULT_EDGE_STYLE,
      data: {
        shape: edgeType,
        labelT: 0.5,
        labelOffset: { x: 0, y: 0 },
        readOnly: true,
        structural,
        loads: conn.load ?? [],
        displayName: conn.displayName || conn.key || "",
        from: conn.from,
        to: conn.to,
        fromName: nameMap.get(conn.from) || conn.from,
        toName: nameMap.get(conn.to) || conn.to,
      },
    } as Edge;
  });

  return { nodes, edges };
}

function buildFlowFromDraft(
  topology: DraftTopologyPayload,
  connectionMap?: Map<string, Connection>
): FlowBundle {
  const nodes: Node[] = [];
  const rawNodes = Array.isArray(topology?.nodes) ? topology.nodes : [];

  rawNodes.forEach((node, idx) => {
    if (!node || typeof node.id !== "string" || !node.id.trim()) return;
    const kindRaw =
      typeof node.kind === "string" ? node.kind.toLowerCase() : "node";
    const kind =
      kindRaw === "core"
        ? ("core" as const)
        : kindRaw === "label"
        ? ("label" as const)
        : ("node" as const);
    const width = asNumber(node.width, 190);
    const height = asNumber(node.height, 80);
    nodes.push(
      makeNode(
        node.id,
        typeof node.label === "string" && node.label.trim()
          ? node.label
          : node.id,
        kind,
        asNumber(node.x, idx * 220),
        asNumber(node.y, idx * 140),
        width,
        height,
        typeof node.color === "string" ? node.color : undefined
      )
    );
  });

  const allowedTypes: Array<Edge["type"]> = [
    "smoothstep",
    "straight",
    "step",
    "bezier",
  ];
  const edges: Edge[] = [];
  const rawEdges = Array.isArray(topology?.edges) ? topology.edges : [];
  const labelById = new Map<string, string>();
  nodes.forEach((node) => {
    const data = node.data as TopologyNodeData | undefined;
    const label = typeof data?.label === "string" ? data.label : undefined;
    labelById.set(node.id, label || node.id);
  });

  rawEdges.forEach((edge, idx) => {
    if (
      !edge ||
      typeof edge.source !== "string" ||
      !edge.source ||
      typeof edge.target !== "string" ||
      !edge.target
    ) {
      return;
    }

    const id =
      typeof edge.id === "string" && edge.id.trim()
        ? edge.id.trim()
        : `edge-${idx}`;
    const type = allowedTypes.includes(edge.type as Edge["type"])
      ? (edge.type as Edge["type"])
      : "smoothstep";
    const structural =
      edge.structural ??
      !(
        Array.isArray(edge.loads) &&
        edge.loads.some((load) => typeof load === "string" && load.trim())
      );
    const labelText = typeof edge.label === "string" ? edge.label : "";
    const connInfo = connectionMap?.get(id);
    const offsetRaw = edge.labelOffset;
    const offset =
      offsetRaw &&
      typeof offsetRaw === "object" &&
      offsetRaw !== null &&
      typeof offsetRaw.x === "number" &&
      typeof offsetRaw.y === "number"
        ? { x: offsetRaw.x, y: offsetRaw.y }
        : { x: 0, y: 0 };
    const labelT =
      typeof edge.labelT === "number" && Number.isFinite(edge.labelT)
        ? Math.min(1, Math.max(0, edge.labelT))
        : 0.5;
    const animated =
      edge.animated === true
        ? true
        : edge.animated === false
        ? false
        : !structural && type !== "straight";

    const srcId = (connInfo?.from as string | undefined) ?? edge.source;
    const tgtId = (connInfo?.to as string | undefined) ?? edge.target;
    const fromName = labelById.get(srcId) || connInfo?.from || edge.source;
    const toName = labelById.get(tgtId) || connInfo?.to || edge.target;

    edges.push({
      id,
      source: edge.source,
      target: edge.target,
      sourceHandle: normalizeHandleId(edge.sourceHandle),
      targetHandle: normalizeHandleId(edge.targetHandle),
      label: labelText,
      type: "labelled",
      animated,
      style: structural ? STRUCTURAL_EDGE_STYLE : DEFAULT_EDGE_STYLE,
      data: {
        shape: type,
        labelT,
        labelOffset: offset,
        readOnly: true,
        structural,
        loads: Array.isArray(edge.loads)
          ? edge.loads.filter(
              (load): load is string => typeof load === "string"
            )
          : connInfo?.load ?? [],
        displayName: connInfo?.displayName || labelText || id,
        from: connInfo?.from,
        to: connInfo?.to,
        fromName,
        toName,
      },
    });
  });

  return { nodes, edges };
}

type ViewerProps = {
  initialSiteCode?: string;
  onSiteChange?: (code: string) => void;
  mode?: "admin" | "public";
};

export default function AdminTopologyViewer({
  initialSiteCode,
  onSiteChange,
  mode = "admin",
}: ViewerProps = {}) {
  const [currentUser, setCurrentUser] = useState(() => loadUser());
  const isAdminMode = mode === "admin";
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isGuest =
    !currentUser || !currentUser.role || currentUser.role === "guest";
  const showGuestIcons = isGuest;
  const [siteOptions, setSiteOptions] = useState<SiteSummary[]>([]);
  const allowSitePicker =
    isAdminMode && (isSuperAdmin || siteOptions.length > 1);
  const [selectedSiteCode, setSelectedSiteCode] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<SiteTopology | null>(null);
  const [flow, setFlow] = useState<FlowBundle>({ nodes: [], edges: [] });
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const edgeTypes = useMemo(() => ({ labelled: DraggableLabelEdge }), []);
  const [offline, setOffline] = useState<Set<string>>(new Set());
  const [altLookup, setAltLookup] = useState<Record<string, AltMap>>({});
  const [hover, setHover] = useState<HoverState>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const resetBtnRef = useRef<HTMLButtonElement | null>(null);
  const normalizedInitial = initialSiteCode?.trim().toUpperCase();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">(
    resolveInitialTheme
  );
  // track previous role to reset guest theme after logout
  const previousRole = useRef<string | null>(currentUser?.role || null);
  const selectedSiteOption = useMemo(
    () => siteOptions.find((site) => site.code === selectedSiteCode) ?? null,
    [siteOptions, selectedSiteCode]
  );
  const handleClosePicker = useCallback(() => setPickerOpen(false), []);
  const fetchSiteSummaries = useCallback(async (): Promise<SiteSummary[]> => {
    if (!isAdminMode || isSuperAdmin) {
      return await listPublishedSiteSummaries();
    }

    const [adminSites, publishedSites] = await Promise.all([
      listAdminSites(),
      listPublishedSiteSummaries(),
    ]);
    const allowedCodes = new Set(
      adminSites.map((site) => site.code.trim().toUpperCase())
    );
    return publishedSites.filter((site) =>
      allowedCodes.has(site.code.trim().toUpperCase())
    );
  }, [isAdminMode, isSuperAdmin]);

  useEffect(() => {
    document.title =
      mode === "public"
        ? "CNFM • Topology Viewer"
        : "CNFM • Published Topology";
  }, [mode]);

  useLayoutEffect(() => {
    applyThemeVars(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<"light" | "dark">).detail;
      if (detail === "light" || detail === "dark") {
        setActiveTheme(detail);
      }
    };
    window.addEventListener("cnfm-theme-change", handler);
    return () => window.removeEventListener("cnfm-theme-change", handler);
  }, []);

  // keep auth state in sync (login/logout without reload)
  useEffect(() => {
    const syncUser = () => setCurrentUser(loadUser());
    const storageHandler = (event: StorageEvent) => {
      if (event.key === "cnfm_user" || event.key === "cnfm_token") {
        syncUser();
      }
    };
    window.addEventListener("cnfm-auth-changed", syncUser as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(
        "cnfm-auth-changed",
        syncUser as EventListener
      );
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // When transitioning from an authenticated role to guest, reset to the
  // default guest theme to avoid mixed states without forcing guests who
  // already toggled their theme.
  useEffect(() => {
    const wasGuest =
      previousRole.current === "guest" || previousRole.current === null;
    if (isGuest && !wasGuest) {
      localStorage.removeItem("cnfm_theme");
      setActiveTheme("light");
      applyThemeVars("light");
    } else if (!isGuest && wasGuest && activeTheme) {
      // ensure admin modes honor saved or current theme; if none, use resolve
      applyThemeVars(activeTheme);
    }
    previousRole.current = currentUser?.role || "guest";
  }, [isGuest, currentUser, activeTheme]);

  useEffect(() => {
    (async () => {
      try {
        const summaries = await fetchSiteSummaries();
        setSiteOptions(summaries);
        const shouldAutoSelect = !isAdminMode || !isSuperAdmin;
        if (summaries.length) {
          setSelectedSiteCode((prev) => {
            if (prev && summaries.some((site) => site.code === prev)) {
              return prev;
            }
            if (
              normalizedInitial &&
              summaries.some((site) => site.code === normalizedInitial)
            ) {
              return normalizedInitial;
            }
            if (shouldAutoSelect) {
              return summaries[0].code;
            }
            return "";
          });
        } else {
          setSelectedSiteCode("");
        }
      } catch (err) {
        console.error("site list error:", err);
        setSiteOptions([]);
        setSelectedSiteCode("");
        setError("Unable to load site list.");
      }
    })();
  }, [normalizedInitial, fetchSiteSummaries, isAdminMode, isSuperAdmin]);

  useEffect(() => {
    if (normalizedInitial && normalizedInitial !== selectedSiteCode) {
      setSelectedSiteCode(normalizedInitial);
    }
  }, [normalizedInitial]);

  useEffect(() => {
    if (selectedSiteCode) {
      onSiteChange?.(selectedSiteCode);
    }
  }, [selectedSiteCode, onSiteChange]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClosePicker();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen, handleClosePicker]);

  useEffect(() => {
    if (isAdminMode) {
      const shouldHavePicker = isSuperAdmin || siteOptions.length > 1;
      if (!shouldHavePicker && pickerOpen) {
        setPickerOpen(false);
      }
    }
  }, [isAdminMode, isSuperAdmin, siteOptions.length, pickerOpen]);
  useEffect(() => {
    if (!isAdminMode) return;
    if (
      selectedSiteCode &&
      !siteOptions.some((site) => site.code === selectedSiteCode)
    ) {
      if (isSuperAdmin) {
        setSelectedSiteCode("");
      } else if (siteOptions.length) {
        setSelectedSiteCode(siteOptions[0].code);
      } else {
        setSelectedSiteCode("");
      }
    } else if (!selectedSiteCode && !isSuperAdmin && siteOptions.length) {
      setSelectedSiteCode(siteOptions[0].code);
    }
  }, [isAdminMode, isSuperAdmin, siteOptions, selectedSiteCode]);

  useEffect(() => {
    if (!selectedSiteCode) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [topo, published] = await Promise.all([
          getSiteTopology(selectedSiteCode),
          getPublishedTopologyPayload(selectedSiteCode).catch((err) => {
            console.error("published topology fetch error:", err);
            return null;
          }),
        ]);

        if (cancelled) return;

        setSelectedSite(topo);
        setServices(extractServiceNames(topo.services));
        setOffline(new Set());
        setAltLookup({});
        setHover(null);

        const connectionMap = new Map<string, Connection>(
          topo.connections.map((conn) => [conn.key, conn])
        );

        const publishedTopology: DraftTopologyPayload | null =
          published && typeof published === "object"
            ? ((published as any).topology as DraftTopologyPayload | null)
            : null;

        if (publishedTopology && Array.isArray(publishedTopology.nodes)) {
          setFlow(buildFlowFromDraft(publishedTopology, connectionMap));
        } else {
          setFlow(buildFlowFromLive(topo));
        }
      } catch (err: any) {
        console.error("topology fetch error:", err);
        if (!cancelled) {
          setSelectedSite(null);
          setFlow({ nodes: [], edges: [] });
          setServices([]);
          setError("Failed to load published topology.");
          await Swal.fire({
            icon: "error",
            title: "Load failed",
            text: "Unable to load published topology. Please try again.",
            confirmButtonColor: "#ef4444",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSiteCode, siteOptions, reactFlowInstance]);

  // Fit view whenever a site is loaded and nodes are present
  useEffect(() => {
    if (!reactFlowInstance) return;
    if (!flow.nodes.length) return;
    const id = requestAnimationFrame(() => {
      try {
        const bounds = getRectOfNodes(flow.nodes);
        const hasSize =
          Number.isFinite(bounds.width) &&
          Number.isFinite(bounds.height) &&
          bounds.width > 0 &&
          bounds.height > 0;
        const padding = 0.04;
        if (hasSize) {
          reactFlowInstance.fitBounds(bounds, {
            padding,
            duration: 500,
          });
        } else {
          reactFlowInstance.fitView({ padding, duration: 500 });
        }
      } catch (err) {
        console.error("fit view error:", err);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [reactFlowInstance, flow.nodes, flow.edges, selectedSiteCode]);

  useEffect(() => {
    if (!selectedSite) {
      setAltLookup({});
      return;
    }
    if (!offline.size) {
      setAltLookup({});
      return;
    }
    const next: Record<string, AltMap> = {};
    for (const key of offline) {
      const alt = findAlternatives(key, selectedSite.connections, offline);
      if (Object.keys(alt).length) {
        next[key] = alt;
      }
    }
    setAltLookup(next);
  }, [offline, selectedSite]);

  const nodeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (selectedSite) {
      map.set(
        selectedSite.site.code,
        selectedSite.site.name || selectedSite.site.code
      );
      selectedSite.placeNodes?.forEach((node) => {
        map.set(node.code, node.name || node.code);
      });
    }
    flow.nodes.forEach((node) => {
      const data = node.data as TopologyNodeData | undefined;
      const label = typeof data?.label === "string" ? data.label : undefined;
      if (label) map.set(node.id, label);
    });
    return map;
  }, [selectedSite, flow.nodes]);

  const connectionsByKey = useMemo(() => {
    const map = new Map<string, NamedConnection>();
    if (!selectedSite) return map;
    selectedSite.connections.forEach((conn) => {
      const fromName = nodeNameMap.get(conn.from) || conn.from;
      const toName = nodeNameMap.get(conn.to) || conn.to;
      map.set(conn.key, { ...conn, fromName, toName });
    });
    return map;
  }, [selectedSite, nodeNameMap]);

  const structuralEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    flow.edges.forEach((edge) => {
      if ((edge.data as any)?.structural) ids.add(edge.id);
    });
    return ids;
  }, [flow.edges]);

  const toggleableEdgeKeys = useMemo(() => {
    // All non-structural edges currently rendered
    return flow.edges
      .filter((edge) => !(edge.data as any)?.structural)
      .map((edge) => edge.id);
  }, [flow.edges]);

  const allOffline = useMemo(
    () =>
      toggleableEdgeKeys.length > 0 &&
      offline.size === toggleableEdgeKeys.length,
    [toggleableEdgeKeys, offline]
  );

  const computeRelativePosition = useCallback(
    (clientX: number, clientY: number) => {
      const wrap = canvasRef.current;
      if (!wrap) return { x: clientX, y: clientY };
      const rect = wrap.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const handleEdgeHover = useCallback(
    (payload: {
      id: string;
      type: "enter" | "move" | "leave";
      clientX: number;
      clientY: number;
    }) => {
      if (payload.type === "leave") {
        setHover((prev) => (prev && prev.key === payload.id ? null : prev));
        return;
      }
      const pos = computeRelativePosition(payload.clientX, payload.clientY);
      setHover({ key: payload.id, x: pos.x, y: pos.y });
    },
    [computeRelativePosition]
  );

  const toggleEdge = useCallback(
    (edgeId: string) => {
      if (structuralEdgeIds.has(edgeId)) return;
      setOffline((prev) => {
        const next = new Set(prev);
        if (next.has(edgeId)) next.delete(edgeId);
        else next.add(edgeId);
        return next;
      });
    },
    [structuralEdgeIds]
  );

  const handleSetAllOffline = useCallback(() => {
    if (!toggleableEdgeKeys.length) return;
    const next = allOffline ? new Set<string>() : new Set(toggleableEdgeKeys);
    setOffline(next);
  }, [toggleableEdgeKeys, allOffline]);

  const offlineCards = useMemo(() => {
    if (!selectedSite)
      return [] as Array<{
        key: string;
        connection: NamedConnection;
        alternatives: Array<{ key: string; title: string; matching: string[] }>;
      }>;
    const items: Array<{
      key: string;
      connection: NamedConnection;
      alternatives: Array<{ key: string; title: string; matching: string[] }>;
    }> = [];
    for (const key of offline) {
      const conn = connectionsByKey.get(key);
      if (!conn) continue;
      const alternatives = Object.entries(altLookup[key] ?? {}).map(
        ([altKey, info]) => ({
          key: altKey,
          title: titleFor(altKey, connectionsByKey),
          matching: info.matchingLoad,
        })
      );
      items.push({ key, connection: conn, alternatives });
    }
    return items;
  }, [offline, connectionsByKey, altLookup, selectedSite]);

  const currentSiteMeta = useMemo(() => {
    if (!selectedSite) return null;
    const match = siteOptions.find(
      (site) => site.code === selectedSite.site.code
    );
    const regionLabel = match?.regionName ?? match?.regionCode ?? "—";
    return {
      code: selectedSite.site.code,
      name: selectedSite.site.name,
      region: regionLabel,
    };
  }, [selectedSite, siteOptions]);

  const isPublicMode = mode === "public";
  const gridColor = useMemo(() => {
    if (!isPublicMode) return "#1f2937";
    return activeTheme === "light" ? "#d1d9e6" : "#1f2738";
  }, [activeTheme, isPublicMode]);

  const sitesByRegion = useMemo(() => {
    const map = new Map<
      string,
      { regionName: string; regionCode: string; sites: SiteSummary[] }
    >();
    siteOptions.forEach((site) => {
      const key = site.regionCode || "UNASSIGNED";
      if (!map.has(key)) {
        map.set(key, {
          regionName: site.regionName || site.regionCode || "Unassigned",
          regionCode: key,
          sites: [],
        });
      }
      map.get(key)!.sites.push(site);
    });
    map.forEach((entry) => {
      entry.sites.sort((a, b) => a.name.localeCompare(b.name));
    });
    return map;
  }, [siteOptions]);

  const regionSections = useMemo(() => {
    return Array.from(sitesByRegion.values()).sort((a, b) =>
      a.regionName.localeCompare(b.regionName)
    );
  }, [sitesByRegion]);

  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setExpandedRegions(() => new Set());
  }, [regionSections, pickerOpen]);

  const toggleRegion = useCallback((code: string) => {
    setExpandedRegions((prev) => {
      const next = new Set<string>();
      const currentlyOpen = prev.has(code);
      if (!currentlyOpen) {
        next.add(code);
      }
      return next;
    });
  }, []);

  const edgePalette = useMemo(() => {
    const readVar = (name: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value.length ? value : fallback;
    };

    if (!isPublicMode) {
      return {
        edge: "#60a5fa",
        alternative: "#34d399",
        offline: "#f87171",
        structural: "rgba(148,163,184,.45)",
        glowEdge: "rgba(96,165,250,.35)",
        glowAlt: "rgba(52,211,153,.35)",
        glowOffline: "rgba(248,113,113,.45)",
        label: { bg: "#facc15", border: "#b45309", color: "#1f2937" },
        labelAlt: { bg: "#34d399", border: "#166534", color: "#022c22" },
        labelOffline: { bg: "#f87171", border: "#991b1b", color: "#fff5f5" },
        labelStructural: {
          bg: "rgba(148,163,184,.15)",
          border: "rgba(148,163,184,.4)",
          color: "#e2e8f0",
        },
      } as const;
    }

    const isLight = activeTheme === "light";
    const fallback = isLight
      ? {
          edge: "#2563eb",
          alternative: "#10b981",
          offline: "#dc2626",
          structural: "rgba(148,163,184,.45)",
          glowEdge: "rgba(37,99,235,.25)",
          glowAlt: "rgba(16,185,129,.28)",
          glowOffline: "rgba(220,38,38,.28)",
          label: { bg: "#fde68a", border: "#f59e0b", color: "#1f2937" },
          labelAlt: { bg: "#bbf7d0", border: "#0f766e", color: "#14532d" },
          labelOffline: { bg: "#fecdd3", border: "#fb7185", color: "#7f1d1d" },
          labelStructural: {
            bg: "rgba(148,163,184,.18)",
            border: "rgba(148,163,184,.45)",
            color: "#475569",
          },
        }
      : ({
          edge: "#60a5fa",
          alternative: "#34d399",
          offline: "#f87171",
          structural: "rgba(148,163,184,.45)",
          glowEdge: "rgba(96,165,250,.35)",
          glowAlt: "rgba(52,211,153,.35)",
          glowOffline: "rgba(248,113,113,.45)",
          label: { bg: "#facc15", border: "#b45309", color: "#1f2937" },
          labelAlt: { bg: "#34d399", border: "#166534", color: "#022c22" },
          labelOffline: { bg: "#f87171", border: "#991b1b", color: "#fff5f5" },
          labelStructural: {
            bg: "rgba(148,163,184,.15)",
            border: "rgba(148,163,184,.4)",
            color: "#e2e8f0",
          },
        } as const);

    return {
      edge: readVar("--viewer-edge-normal", fallback.edge),
      alternative: readVar("--viewer-edge-alt", fallback.alternative),
      offline: readVar("--viewer-edge-offline", fallback.offline),
      structural: readVar("--viewer-edge-structural", fallback.structural),
      glowEdge: readVar("--viewer-edge-glow", fallback.glowEdge),
      glowAlt: readVar("--viewer-edge-glow-alt", fallback.glowAlt),
      glowOffline: readVar("--viewer-edge-glow-offline", fallback.glowOffline),
      label: {
        bg: readVar("--viewer-edge-label-bg", fallback.label.bg),
        border: readVar("--viewer-edge-label-border", fallback.label.border),
        color: readVar("--viewer-edge-label-text", fallback.label.color),
      },
      labelAlt: {
        bg: readVar("--viewer-edge-label-alt-bg", fallback.labelAlt.bg),
        border: readVar(
          "--viewer-edge-label-alt-border",
          fallback.labelAlt.border
        ),
        color: readVar("--viewer-edge-label-alt-text", fallback.labelAlt.color),
      },
      labelOffline: {
        bg: readVar("--viewer-edge-label-offline-bg", fallback.labelOffline.bg),
        border: readVar(
          "--viewer-edge-label-offline-border",
          fallback.labelOffline.border
        ),
        color: readVar(
          "--viewer-edge-label-offline-text",
          fallback.labelOffline.color
        ),
      },
      labelStructural: {
        bg: readVar(
          "--viewer-edge-label-structural-bg",
          fallback.labelStructural.bg
        ),
        border: readVar(
          "--viewer-edge-label-structural-border",
          fallback.labelStructural.border
        ),
        color: readVar(
          "--viewer-edge-label-structural-text",
          fallback.labelStructural.color
        ),
      },
    } as const;
  }, [isPublicMode, activeTheme]);

  const decoratedEdges = useMemo(() => {
    return flow.edges.map((edge) => {
      const baseData = (edge.data as any) ?? {};
      const structural = !!baseData.structural;
      const conn = connectionsByKey.get(edge.id);
      const isOffline = !structural && offline.has(edge.id);
      const isAlternative =
        !structural &&
        !isOffline &&
        Object.values(altLookup).some((map) => !!map[edge.id]?.isAlternative);
      const hovered = hover?.key === edge.id;

      const baseStyle = structural ? STRUCTURAL_EDGE_STYLE : DEFAULT_EDGE_STYLE;
      const style = {
        ...baseStyle,
        stroke: structural ? edgePalette.structural : edgePalette.edge,
        strokeWidth: hovered ? (structural ? 5 : 6) : structural ? 3 : 4,
        filter:
          hovered && !structural
            ? `drop-shadow(0 0 10px ${edgePalette.glowEdge})`
            : undefined,
      } as Edge["style"];

      if (style) {
        if (isOffline) {
          style.stroke = edgePalette.offline;
          style.filter = `drop-shadow(0 0 12px ${edgePalette.glowOffline})`;
        } else if (isAlternative) {
          style.stroke = edgePalette.alternative;
          style.filter = `drop-shadow(0 0 12px ${edgePalette.glowAlt})`;
        }
      }

      const labelConfig = structural
        ? edgePalette.labelStructural
        : isOffline
        ? edgePalette.labelOffline
        : isAlternative
        ? edgePalette.labelAlt
        : edgePalette.label;

      return {
        ...edge,
        animated: isOffline ? false : edge.animated && !structural,
        style,
        data: {
          ...baseData,
          readOnly: true,
          structural,
          isOffline,
          isAlternative,
          loads: baseData.loads ?? conn?.load ?? [],
          displayName:
            baseData.displayName ?? conn?.displayName ?? edge.label ?? edge.id,
          from: baseData.from ?? conn?.from,
          to: baseData.to ?? conn?.to,
          fromName:
            conn?.fromName ?? baseData.fromName ?? conn?.from ?? edge.source,
          toName: conn?.toName ?? baseData.toName ?? conn?.to ?? edge.target,
          onToggle: structural ? undefined : toggleEdge,
          onHoverChange: handleEdgeHover,
          labelBg: labelConfig.bg,
          labelBorder: labelConfig.border,
          labelColor: labelConfig.color,
          labelTitle: structural
            ? "Structural reference link"
            : "Click to toggle route status",
        },
      } as Edge;
    });
  }, [
    flow.edges,
    offline,
    altLookup,
    toggleEdge,
    handleEdgeHover,
    connectionsByKey,
    hover,
    edgePalette,
  ]);

  const hoverDetails = useMemo(() => {
    if (!hover) return null;
    return getHoverDetails(hover.key, connectionsByKey, offline, altLookup);
  }, [hover, connectionsByKey, offline, altLookup]);
  const headerEyebrow = isPublicMode
    ? "Globe Network WarGames"
    : "Published Topology";
  const needsSiteSelection = isAdminMode && !selectedSiteCode;
  const handleToggleTheme = useCallback(() => {
    const next = activeTheme === "dark" ? "light" : "dark";
    applyThemeVars(next);
    setActiveTheme(next);
  }, [activeTheme]);

  const handleOpenLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  }, []);

  return (
    <div
      className={`topology-viewer-shell ${
        isPublicMode ? "public-mode" : "admin-mode"
      }`}
    >
      <header className="viewer-header">
        <div className="viewer-header-top">
          <div className="viewer-eyebrow-stack">
            <img
              src="/CNFM%20Logo.png"
              alt="CNFM"
              className="viewer-logo"
              width={32}
              height={32}
            />
            <p
              className={`viewer-eyebrow ${
                isGuest || isPublicMode ? "accent" : ""
              }`}
            >
              {headerEyebrow}
            </p>
          </div>
          <div className="viewer-top-actions">
            {showGuestIcons ? (
              <>
                <button
                  type="button"
                  className="viewer-icon-btn"
                  onClick={handleToggleTheme}
                  aria-label={
                    activeTheme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                >
                  {activeTheme === "dark" ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm5 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 8a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Zm-8-8a1 1 0 0 1 1-1H6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm15 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Zm-2.95-5.95a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.42l-.71-.72a1 1 0 0 1 0-1.41ZM6.54 17.46a1 1 0 0 1 1.41 0l.72.71a1 1 0 1 1-1.42 1.41l-.71-.71a1 1 0 0 1 0-1.41Zm0-12.92.71.72a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 1 1 1.41-1.42ZM17.46 17.46l.71.71a1 1 0 1 1-1.41 1.41l-.72-.71a1 1 0 1 1 1.42-1.41Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  className="viewer-icon-btn"
                  onClick={handleOpenLogin}
                  aria-label="Open login"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 3a1 1 0 0 0-1 1v3h2V5h8v14h-8v-2h-2v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H11Zm1.7 5.3-1.4 1.4L13.58 12H3v2h10.59l-2.29 2.29 1.4 1.42L18.4 12l-5.7-5.7Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </>
            ) : isAdminMode ? (
              allowSitePicker ? (
                <>
                  <button
                    type="button"
                    className="viewer-select-btn viewer-btn ghost"
                    onClick={() => allowSitePicker && setPickerOpen(true)}
                    disabled={!siteOptions.length || loading}
                    aria-haspopup="dialog"
                    aria-expanded={pickerOpen}
                  >
                    <span className="viewer-select-label">
                      {selectedSiteCode && selectedSiteOption
                        ? `${selectedSiteOption.name} · ${
                            selectedSiteOption.regionName ||
                            selectedSiteOption.regionCode
                          }`
                        : "Select Site to View"}
                    </span>
                    <span className="viewer-select-caret" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  <div className="viewer-status-group compact">
                    {loading && <span className="viewer-status">Loading…</span>}
                    {error && (
                      <span className="viewer-status error">{error}</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="viewer-summary-stack inline">
                  <div className="editor-site-summary-card inline-summary">
                    <p className="editor-site-summary inline">
                      <span className="editor-site-label-inline">
                        Assigned site:
                      </span>
                      {selectedSiteOption ? (
                        <>
                          <span className="code">
                            {selectedSiteOption.name}
                          </span>
                          <span className="separator" aria-hidden>
                            •
                          </span>
                          <span className="region">
                            {selectedSiteOption.regionName ||
                              selectedSiteOption.regionCode ||
                              "Unassigned region"}
                          </span>
                        </>
                      ) : (
                        <span className="region">Unassigned</span>
                      )}
                    </p>
                  </div>
                  <div className="viewer-status-group compact">
                    {loading && <span className="viewer-status">Loading…</span>}
                    {error && (
                      <span className="viewer-status error">{error}</span>
                    )}
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>
      </header>

      <div className="viewer-layout">
        <div className="viewer-canvas" ref={canvasRef}>
          <div className="viewer-toolbar">
            <div className="viewer-legend">
              <span className="dot normal" />
              <span>Normal</span>
              <span className="dot alt" />
              <span>Alternate</span>
              <span className="dot off" />
              <span>Offline</span>
            </div>
            <div className="viewer-toolbar-actions">
              <button
                ref={resetBtnRef}
                className="viewer-btn viewer-toggle-pill"
                onClick={handleSetAllOffline}
                disabled={!toggleableEdgeKeys.length}
              >
                {allOffline ? "Reset All to Online" : "Set All Offline"}
              </button>
            </div>
          </div>
          <ReactFlow
            nodes={flow.nodes}
            edges={decoratedEdges}
            nodeTypes={{ topology: TopologyNode }}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
            preventScrolling={false}
            onInit={setReactFlowInstance}
            fitView
            className="viewer-flow"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1}
              color={gridColor}
            />
            <Controls showInteractive={false} className="viewer-controls" />
          </ReactFlow>
          {hover && hoverDetails && (
            <HoverCard
              x={hover.x}
              y={hover.y}
              data={hoverDetails}
              containerRef={canvasRef}
            />
          )}
          {!loading && needsSiteSelection && (
            <div className="viewer-empty">
              {allowSitePicker ? (
                <>
                  <p>Select a site to view its published topology.</p>
                  <p>Use the picker above to load an existing layout.</p>
                </>
              ) : (
                <>
                  <p>No site has been assigned to your account yet.</p>
                  <p>Please contact a Super Admin to request access.</p>
                </>
              )}
            </div>
          )}
          {!loading && !needsSiteSelection && !flow.nodes.length && (
            <div className="viewer-empty">
              {isPublicMode ? (
                <>
                  <p>No published topology is available for this site.</p>
                  <p>Select another site from the sidebar to continue.</p>
                </>
              ) : (
                <>
                  <p>No published topology found for this site.</p>
                  <p>Use the topology builder to publish a layout.</p>
                </>
              )}
            </div>
          )}
        </div>

        <aside className="viewer-panel">
          <h2>Site details</h2>
          {currentSiteMeta ? (
            <ul className="viewer-meta">
              <li>
                <span className="k">Region</span>
                <span className="v">{currentSiteMeta.region}</span>
              </li>
              <li>
                <span className="k">Site</span>
                <span className="v">{currentSiteMeta.name}</span>
              </li>
            </ul>
          ) : (
            <p className="viewer-hint">Pick a site to see details.</p>
          )}

          <h3>Services</h3>
          {services.length ? (
            <ul className="viewer-services">
              {services.map((svc) => (
                <li key={svc}>{svc}</li>
              ))}
            </ul>
          ) : (
            <p className="viewer-hint">No published services listed.</p>
          )}

          <h3>Route Analysis</h3>
          {offlineCards.length ? (
            <div className="viewer-analysis-stack">
              {offlineCards.map((item) => {
                const connectionName = item.connection.displayName || item.key;
                const route =
                  `${item.connection.fromName || item.connection.from} → ` +
                  `${item.connection.toName || item.connection.to}`;
                return (
                  <article key={item.key} className="analysis-entry">
                    <header>
                      <h4>{connectionName}</h4>
                      <span className="badge offline">OFFLINE</span>
                    </header>
                    {item.connection.load.length > 0 && (
                      <p className="analysis-load">
                        <span className="label">Load:</span>{" "}
                        <span className="value">
                          {item.connection.load.join(", ")}
                        </span>
                      </p>
                    )}
                    <p className="analysis-route">
                      <span className="label">Route:</span>{" "}
                      <span className="value">{route}</span>
                    </p>
                    {item.alternatives.length > 0 && (
                      <section className="analysis-alternates">
                        <span className="label">Alternate Route:</span>
                        <ul>
                          {item.alternatives.map((alt) => (
                            <li key={alt.key}>
                              <strong>{alt.title}</strong>
                              {alt.matching.length > 0 && (
                                <span className="match">
                                  {" "}
                                  – Matching: {alt.matching.join(", ")}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="viewer-hint">
              No connections offline. All routes are operational.
            </p>
          )}
        </aside>
      </div>

      {allowSitePicker && pickerOpen && (
        <div
          className="viewer-modal-backdrop"
          role="presentation"
          onClick={handleClosePicker}
        >
          <div
            className="viewer-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Select site"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="viewer-modal-header">
              <h2>Select site</h2>
              <button
                type="button"
                className="viewer-modal-close"
                onClick={handleClosePicker}
                aria-label="Close site picker"
              >
                ×
              </button>
            </header>
            <div className="viewer-modal-body">
              {regionSections.length ? (
                regionSections.map((section) => {
                  const isOpen = expandedRegions.has(section.regionCode);
                  return (
                    <div
                      key={section.regionCode}
                      className={`viewer-modal-section ${
                        isOpen ? "open" : "closed"
                      }`}
                    >
                      <button
                        type="button"
                        className="viewer-modal-region"
                        onClick={() => toggleRegion(section.regionCode)}
                        aria-expanded={isOpen}
                      >
                        <span className="region-name">
                          {section.regionName}
                        </span>
                        <span className="region-count">
                          {section.sites.length} site
                          {section.sites.length === 1 ? "" : "s"}
                        </span>
                        <span className="region-caret" aria-hidden>
                          ▾
                        </span>
                      </button>
                      {isOpen && (
                        <ul>
                          {section.sites.length ? (
                            section.sites.map((site) => {
                              const isActive = site.code === selectedSiteCode;
                              return (
                                <li key={site.id}>
                                  <button
                                    type="button"
                                    className={[
                                      "viewer-modal-site",
                                      isActive ? "active" : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    onClick={() => {
                                      setSelectedSiteCode(site.code);
                                      handleClosePicker();
                                    }}
                                  >
                                    <span className="site-name">
                                      {site.name}
                                    </span>
                                    <span className="site-region">
                                      {site.regionName || site.regionCode}
                                    </span>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="viewer-modal-empty">
                              No sites in this region.
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="viewer-modal-empty">No sites available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
