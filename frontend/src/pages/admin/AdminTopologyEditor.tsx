import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import Swal from "sweetalert2";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "./AdminTopologyEditor.css";
import { getRegions, getSiteTopology } from "../../services/network";
import { loadUser } from "../../services/auth";
import type { PlaceNode, SiteTopology } from "../../types/topology";
import {
  addSiteService,
  createAdminSite,
  deleteAdminSite,
  deleteSiteService,
  fetchTopologyDraft,
  listAdminSites,
  listLoadTags,
  publishTopology,
  saveTopologyDraft,
  updateSiteService,
  type AdminSiteSummary,
} from "../../services/adminTopology";
import TopologyNode, { type TopologyNodeData } from "./TopologyNode";
import DraggableLabelEdge from "./edges/DraggableLabelEdge";

type BaseEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  color?: string;
  structural?: boolean;
  loads: string[];
  type?: "straight" | "smoothstep" | "step" | "bezier";
  animated?: boolean;
  labelT?: number;
  labelOffset?: { x: number; y: number };
};

type FlowBundle = {
  nodes: Node[];
  edges: BaseEdge[];
};

type DraftTopology = {
  nodes: Array<{
    id: string;
    label?: string;
    name?: string;
    code?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    kind?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    color?: string;
    structural?: boolean;
    loads?: string[];
    type?: "straight" | "smoothstep" | "step" | "bezier";
    animated?: boolean;
    labelT?: number;
    labelOffset?: { x: number; y: number };
  }>;
};

type ViewEdgeData = {
  baseId: string;
  loadIndex: number; // -1 when structural
  structural: boolean;
  shape: "straight" | "smoothstep" | "step" | "bezier";
  labelT: number;
  labelOffset: { x: number; y: number };
  onLabelPositionChange: (edgeId: string, payload: { t: number }) => void;
};

type ViewEdge = Edge<ViewEdgeData>;

type Selection =
  | { type: "node"; id: string }
  | { type: "edge"; id: string; loadIndex: number };

type ServiceItem = {
  id?: number;
  name: string;
  sortOrder?: number;
};

function sortServiceItems(list: ServiceItem[]): ServiceItem[] {
  return [...list].sort((a, b) => {
    const orderA =
      typeof a.sortOrder === "number" ? a.sortOrder : Number.MAX_SAFE_INTEGER;
    const orderB =
      typeof b.sortOrder === "number" ? b.sortOrder : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

function nodeData(node: Node): Record<string, any> | undefined {
  return (node.data as Record<string, any> | undefined) ?? undefined;
}

function nodeKind(node: Node): string {
  const data = nodeData(node);
  if (typeof data?.kind === "string" && data.kind.length) return data.kind;
  const direct = (node as any)?.kind;
  return typeof direct === "string" && direct.length ? direct : "node";
}

function ensuredNodeLabel(node: Node): string {
  const data = nodeData(node);
  if (typeof data?.label === "string" && data.label.length) return data.label;
  if (typeof (node as any)?.label === "string" && (node as any).label.length)
    return (node as any).label;
  return node.id;
}

function withEnsuredNodeLabels(list: Node[]): Node[] {
  return list.map((node) => {
    const label = ensuredNodeLabel(node);
    const data = nodeData(node);
    if (data?.label === label) return node;
    return {
      ...node,
      data: { ...(data ?? {}), label },
    };
  });
}

function normalizeHandleId(id?: string | null): string | undefined {
  if (typeof id !== "string") return undefined;
  const match = id.match(/^(s|t)-(top|bottom|left|right)-(\d+)$/);
  if (!match) return undefined;
  const [, prefix, side] = match;
  return `${prefix}-${side}-1`;
}

function sanitizeEdges(list: BaseEdge[]): BaseEdge[] {
  const allowed: Array<BaseEdge["type"]> = [
    "smoothstep",
    "straight",
    "step",
    "bezier",
  ];
  return list.map((edge) => ({
    ...edge,
    sourceHandle: normalizeHandleId(edge.sourceHandle),
    targetHandle: normalizeHandleId(edge.targetHandle),
    type: allowed.includes(edge.type) ? edge.type : undefined,
    labelOffset:
      edge.labelOffset &&
      typeof edge.labelOffset.x === "number" &&
      typeof edge.labelOffset.y === "number"
        ? { x: edge.labelOffset.x, y: edge.labelOffset.y }
        : { x: 0, y: 0 },
    labelT:
      typeof edge.labelT === "number" && Number.isFinite(edge.labelT)
        ? Math.min(1, Math.max(0, edge.labelT))
        : 0.5,
  }));
}

const DEFAULT_EDGE_STYLE: CSSProperties = { strokeWidth: 4, stroke: "#2563eb" };
const STRUCTURAL_EDGE_STYLE: CSSProperties = {
  strokeWidth: 3,
  stroke: "rgba(148,163,184,.45)",
};

const DEFAULT_NODE_STYLE: CSSProperties = {
  background: "#1d4ed8",
  color: "#fff",
  borderRadius: 16,
  padding: "12px 20px",
  fontWeight: 700,
  letterSpacing: ".05em",
  boxShadow: "0 12px 30px rgba(37,99,235,.35)",
};

const SECONDARY_NODE_STYLE: CSSProperties = {
  background: "#0f172a",
  color: "#e2e8f0",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 600,
  letterSpacing: ".05em",
  boxShadow: "0 10px 24px rgba(15,23,42,.35)",
};

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 10v7M14 10v7M9 7l1-2h4l1 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconNodes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="12"
        y="12"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconBlock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconDeleteSelection() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="m9.5 9.5 5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 5h10l2 2v12H5V5h2Zm0 0v6h10V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10 5v4h4V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPublish() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 6v12m0-12 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 18h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function showSuccessToast(title: string) {
  return fireToast("success", title);
}

function showErrorToast(title: string) {
  return fireToast("error", title);
}

function fireToast(icon: "success" | "error", title: string) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  return Toast.fire({ icon, title });
}

function ensureNode(
  map: Map<string, Node>,
  code: string,
  label: string,
  pos: { x?: number | null; y?: number | null } = {},
  kind: string = "node",
  size: { width?: number; height?: number } = {}
) {
  if (map.has(code)) return;
  const baseStyle = kind === "core" ? DEFAULT_NODE_STYLE : SECONDARY_NODE_STYLE;
  const widthVal = typeof size.width === "number" ? size.width : 190;
  const heightVal = typeof size.height === "number" ? size.height : 80;
  const data: TopologyNodeData = {
    label,
    kind,
    style: baseStyle,
  };
  map.set(code, {
    id: code,
    type: "topology",
    data,
    position: {
      x: typeof pos.x === "number" ? pos.x : map.size * 160,
      y: typeof pos.y === "number" ? pos.y : map.size * 100,
    },
    width: widthVal,
    height: heightVal,
    style: { width: widthVal, height: heightVal },
  });
}

function makeFlowFromTopology(payload: SiteTopology): FlowBundle {
  const nodeMap = new Map<string, Node>();
  const placeMap = new Map<string, PlaceNode>();

  payload.placeNodes?.forEach((pn) => placeMap.set(pn.code, pn));

  const main = payload.site;
  ensureNode(
    nodeMap,
    main.code,
    main.name || main.code,
    { x: main.x, y: main.y },
    "core",
    {
      width: typeof main.width === "number" ? main.width : 190,
      height: typeof main.height === "number" ? main.height : 80,
    }
  );

  placeMap.forEach((pn) => {
    ensureNode(
      nodeMap,
      pn.code,
      pn.name || pn.code,
      { x: pn.x, y: pn.y },
      "node",
      {
        width: typeof pn.width === "number" ? pn.width : 190,
        height: typeof pn.height === "number" ? pn.height : 80,
      }
    );
  });

  const edges: BaseEdge[] = payload.connections.map((conn, idx) => ({
    id: conn.key || `edge-${idx}`,
    source: conn.from || payload.site.code,
    target: conn.to || payload.site.code,
    label: conn.displayName || conn.key || undefined,
    color: undefined,
    structural: !(conn.load && conn.load.length),
    loads: conn.load ? [...conn.load] : [],
    labelT: 0.5,
    labelOffset: { x: 0, y: 0 },
  }));

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

function flowFromDraft(topology: DraftTopology): FlowBundle {
  const nodes: Node[] = (topology.nodes || []).map((n, idx) => {
    const kind = n.kind || "node";
    const baseStyle =
      kind === "core" ? DEFAULT_NODE_STYLE : SECONDARY_NODE_STYLE;
    const styleOverride = n.color
      ? { ...baseStyle, background: n.color }
      : baseStyle;
    const widthVal = typeof n.width === "number" ? n.width : 190;
    const heightVal = typeof n.height === "number" ? n.height : 80;
    const labelText = n.label || (n as any)?.name || n.id;
    const data: TopologyNodeData = {
      label: labelText,
      kind,
      style: styleOverride,
    };
    return {
      id: n.id,
      type: "topology",
      data,
      position: {
        x: typeof n.x === "number" ? n.x : idx * 200,
        y: typeof n.y === "number" ? n.y : idx * 120,
      },
      width: widthVal,
      height: heightVal,
      style: { width: widthVal, height: heightVal },
    };
  });

  const edges: BaseEdge[] = (topology.edges || []).map((edge, idx) => {
    const rawType = (edge as any)?.type;
    const allowed: Array<BaseEdge["type"]> = [
      "smoothstep",
      "straight",
      "step",
      "bezier",
    ];
    const cleanType = allowed.includes(rawType) ? rawType : undefined;
    const offsetRaw = (edge as any)?.labelOffset;
    const offsetClean =
      offsetRaw &&
      typeof offsetRaw.x === "number" &&
      typeof offsetRaw.y === "number"
        ? { x: offsetRaw.x, y: offsetRaw.y }
        : undefined;
    return {
      id: edge.id || `edge-${idx}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: normalizeHandleId(edge.sourceHandle),
      targetHandle: normalizeHandleId(edge.targetHandle),
      label: edge.label,
      color: edge.color,
      structural: edge.structural ?? !(edge.loads && edge.loads.length),
      loads: edge.loads ? [...edge.loads] : [],
      type: cleanType,
      animated: (edge as any)?.animated === true,
      labelT: (edge as any)?.labelT ?? undefined,
      labelOffset: offsetClean,
    };
  });

  return { nodes, edges };
}

function serializeDraft(nodes: Node[], edges: BaseEdge[]): DraftTopology {
  const dimValue = (node: Node, key: "width" | "height") => {
    const direct = node[key];
    if (typeof direct === "number" && Number.isFinite(direct)) return direct;
    const styleVal = (node.style as any)?.[key];
    if (typeof styleVal === "number" && Number.isFinite(styleVal))
      return styleVal;
    if (typeof styleVal === "string") {
      const parsed = parseFloat(styleVal);
      if (Number.isFinite(parsed)) return parsed;
    }
    const dataStyleVal = (nodeData(node)?.style as any)?.[key];
    if (typeof dataStyleVal === "number" && Number.isFinite(dataStyleVal))
      return dataStyleVal;
    if (typeof dataStyleVal === "string") {
      const parsed = parseFloat(dataStyleVal);
      if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
  };

  const takenIds = new Set<string>();
  const idMap = new Map<string, string>();
  nodes.forEach((node) => {
    const kind = nodeKind(node);
    if (kind === "core") {
      idMap.set(node.id, node.id);
      takenIds.add(node.id);
      return;
    }
    const label = ensuredNodeLabel(node).trim();
    const baseId = label || node.id;
    let candidate = baseId;
    let counter = 2;
    while (takenIds.has(candidate)) {
      candidate = `${baseId}-${counter++}`;
    }
    takenIds.add(candidate);
    idMap.set(node.id, candidate);
  });

  return {
    nodes: nodes.map((node) => {
      const persistedId = idMap.get(node.id) ?? node.id;
      const label = ensuredNodeLabel(node);
      return {
        id: persistedId,
        label,
        name: label,
        code: persistedId,
        x: node.position.x,
        y: node.position.y,
        color: (() => {
          const data = nodeData(node);
          const bg = data?.style?.background ?? node.style?.background;
          return typeof bg === "string" ? bg : undefined;
        })(),
        width: dimValue(node, "width"),
        height: dimValue(node, "height"),
        kind: nodeKind(node),
      };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: idMap.get(edge.source) ?? edge.source,
      target: idMap.get(edge.target) ?? edge.target,
      sourceHandle: normalizeHandleId(edge.sourceHandle),
      targetHandle: normalizeHandleId(edge.targetHandle),
      label: edge.label ?? "",
      color: edge.color,
      structural: !!edge.structural,
      loads: edge.loads,
      type: edge.type,
      animated: !!edge.animated,
      labelT: edge.labelT,
    })),
  };
}

export default function AdminTopologyEditor() {
  const [connecting, setConnecting] = useState(false);
  const [regions, setRegions] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [siteOptions, setSiteOptions] = useState<AdminSiteSummary[]>([]);
  const [hiddenSiteIds, setHiddenSiteIds] = useState<number[]>([]);
  const [pendingManagerSite, setPendingManagerSite] = useState<{
    id: number;
    code: string;
    name: string;
  } | null>(null);
  const [siteListLoading, setSiteListLoading] = useState(false);
  const [siteListError, setSiteListError] = useState<string | null>(null);
  const [selectedSiteCode, setSelectedSiteCode] = useState<string | null>(null);

  const [nodes, setNodes, rawOnNodesChange] = useNodesState([]);
  const [baseEdges, setBaseEdges] = useState<BaseEdge[]>([]);
  const [dirty, setDirty] = useState(false);
  const [siteServices, setSiteServices] = useState<ServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [addingService, setAddingService] = useState(false);
  const [serviceActionId, setServiceActionId] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const edgeReconnectSuccess = useRef(false);
  const edgeReconnectSnapshot = useRef<BaseEdge | null>(null);

  useEffect(() => {
    setBaseEdges((edges) => sanitizeEdges(edges));
  }, []);

  useEffect(() => {
    if (!hiddenSiteIds.length) return;
    setHiddenSiteIds((prev) =>
      prev.filter((id) => siteOptions.some((site) => site.id === id))
    );
  }, [siteOptions]);

  const handleLabelPositionChange = useCallback(
    (edgeId: string, payload: { t: number }) => {
      const clampT = Math.min(1, Math.max(0, payload.t));
      setBaseEdges((edges) =>
        edges.map((edge) =>
          edge.id === edgeId
            ? { ...edge, labelT: clampT, labelOffset: { x: 0, y: 0 } }
            : edge
        )
      );
      setDirty(true);
    },
    []
  );

  const handleEdgeHover = useCallback(
    ({ id, type }: { id: string; type: "enter" | "move" | "leave" }) => {
      if (type === "enter") setHoveredEdgeId(id);
      if (type === "leave")
        setHoveredEdgeId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const viewEdges = useMemo(() => {
    return baseEdges.map((edge) => {
      const sh = normalizeHandleId(edge.sourceHandle);
      const th = normalizeHandleId(edge.targetHandle);
      const labelText = edge.label ?? "";
      const allowed: ViewEdgeData["shape"][] = [
        "smoothstep",
        "straight",
        "step",
        "bezier",
      ];
      const shape = allowed.includes(edge.type as any)
        ? (edge.type as ViewEdgeData["shape"])
        : "smoothstep";
      const isHovered = hoveredEdgeId === edge.id;
      const baseStyle = edge.structural
        ? STRUCTURAL_EDGE_STYLE
        : DEFAULT_EDGE_STYLE;
      const baseWidth =
        typeof baseStyle?.strokeWidth === "number"
          ? baseStyle.strokeWidth
          : undefined;
      const styleWithHover = isHovered
        ? {
            ...baseStyle,
            stroke: edge.structural ? "#94a3b8" : "#38bdf8",
            strokeWidth:
              typeof baseWidth === "number"
                ? baseWidth + 1
                : baseStyle?.strokeWidth,
            filter: "drop-shadow(0 0 0.45rem rgba(56,189,248,.5))",
          }
        : baseStyle;
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: sh,
        targetHandle: th,
        label: labelText,
        type: "draggable",
        animated: !!edge.animated,
        style: styleWithHover,
        labelBgPadding: labelText ? [6, 3] : undefined,
        labelBgBorderRadius: labelText ? 999 : undefined,
        labelBgStyle: labelText
          ? { fill: "#facc15", stroke: "#b45309", strokeWidth: 0.6 }
          : undefined,
        labelStyle: labelText
          ? {
              fontWeight: 700,
              letterSpacing: ".01em",
              color: "#1f2937",
              fontSize: 11,
            }
          : undefined,
        interactionWidth: 28,
        data: {
          baseId: edge.id,
          loadIndex: -1,
          structural: !!edge.structural,
          shape,
          labelT: typeof edge.labelT === "number" ? edge.labelT : 0.5,
          labelOffset: edge.labelOffset ?? { x: 0, y: 0 },
          onLabelPositionChange: handleLabelPositionChange,
          onHoverChange: handleEdgeHover,
        },
      } as ViewEdge;
    });
  }, [baseEdges, handleLabelPositionChange, hoveredEdgeId, handleEdgeHover]);

  const [currentSiteMeta, setCurrentSiteMeta] = useState<{
    id: number;
    code: string;
    name: string;
  } | null>(null);

  const [fetchState, setFetchState] = useState({
    loading: false,
    error: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deletingSite, setDeletingSite] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [newLoadInput, setNewLoadInput] = useState("");
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [creatingSite, setCreatingSite] = useState(false);
  const [createSiteForm, setCreateSiteForm] = useState({
    name: "",
    regionCode: "",
  });
  const [sitePickerOpen, setSitePickerOpen] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >({});
  const [servicesCollapsed, setServicesCollapsed] = useState(false);
  const [serviceMenuId, setServiceMenuId] = useState<string | number | null>(
    null
  );
  const navigate = useNavigate();
  const currentUser = useMemo(() => loadUser(), []);
  const userRole = currentUser?.role ?? "guest";
  const isSuperAdmin = userRole === "super_admin";
  const deniedSiteRef = useRef(false);
  const handleAssignManagerNow = useCallback(() => {
    if (!pendingManagerSite) return;
    navigate(
      `/admin/users?siteCode=${encodeURIComponent(pendingManagerSite.code)}`
    );
  }, [navigate, pendingManagerSite]);

  const handleConfirmManagerAssignment = useCallback(async () => {
    if (!pendingManagerSite) return;
    try {
      setSiteListLoading(true);
      const sites = await listAdminSites();
      setSiteOptions(sites);
      setSiteListError(null);
      setHiddenSiteIds((prev) =>
        prev.filter((id) => id !== pendingManagerSite.id)
      );
      setPendingManagerSite(null);
    } catch (err) {
      console.error("site list refresh error:", err);
      setSiteListError("Failed to refresh site list.");
    } finally {
      setSiteListLoading(false);
    }
  }, [pendingManagerSite]);
  const [loadTagOptions, setLoadTagOptions] = useState<string[]>([]);
  const [selectedLoadOptions, setSelectedLoadOptions] = useState<string[]>([]);
  const [loadTagFilter, setLoadTagFilter] = useState("");
  const loadFilterInputRef = useRef<HTMLInputElement | null>(null);
  const filteredLoadOptions = useMemo(() => {
    const term = loadTagFilter.trim().toLowerCase();
    if (!term) return loadTagOptions;
    return loadTagOptions.filter((tag) => tag.toLowerCase().includes(term));
  }, [loadTagOptions, loadTagFilter]);

  const nodeTypes = useMemo(() => ({ topology: TopologyNode }), []);
  const edgeTypes = useMemo(() => ({ draggable: DraggableLabelEdge }), []);
  const upsertLoadTagOption = useCallback((tag: string) => {
    const normalized = tag.trim();
    if (!normalized) return;
    setLoadTagOptions((prev) => {
      if (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()))
        return prev;
      return [...prev, normalized].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );
    });
  }, []);

  const visibleSiteOptions = useMemo(() => {
    if (!hiddenSiteIds.length) return siteOptions;
    return siteOptions.filter(
      (site) =>
        !hiddenSiteIds.includes(site.id) || site.code === selectedSiteCode
    );
  }, [siteOptions, hiddenSiteIds, selectedSiteCode]);

  useEffect(() => {
    if (isSuperAdmin) return;
    if (!visibleSiteOptions.length) {
      setSelectedSiteCode(null);
      setCurrentSiteMeta(null);
      return;
    }
    setSelectedSiteCode((prev) => {
      if (prev && visibleSiteOptions.some((site) => site.code === prev)) {
        return prev;
      }
      return visibleSiteOptions[0].code;
    });
  }, [isSuperAdmin, visibleSiteOptions]);

  useEffect(() => {
    document.title = "CNFM • Topology Builder";
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tags = await listLoadTags();
        if (!cancelled) {
          setLoadTagOptions(
            Array.from(new Set(tags.filter((tag) => typeof tag === "string")))
          );
        }
      } catch (err) {
        console.error("load tag list error:", err);
        if (!cancelled) {
          await showErrorToast("Failed to load load-tag suggestions.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const regionList = await getRegions();
        setRegions(regionList.map((r) => ({ code: r.code, name: r.name })));
        if (!createSiteForm.regionCode && regionList.length) {
          setCreateSiteForm((prev) => ({
            ...prev,
            regionCode: regionList[0].code,
          }));
        }
      } catch (err) {
        console.error("regions load error:", err);
        await showErrorToast("Failed to load regions.");
      }
    })();
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      deniedSiteRef.current = false;
      return;
    }
    if (
      selectedSiteCode &&
      !visibleSiteOptions.some((site) => site.code === selectedSiteCode)
    ) {
      if (deniedSiteRef.current) return;
      deniedSiteRef.current = true;
      Swal.fire({
        icon: "error",
        title: "Access denied",
        text: "You do not have permission to edit that site.",
        confirmButtonColor: "#ef4444",
      }).finally(() => {
        setSelectedSiteCode(null);
        setCurrentSiteMeta(null);
        setNodes([]);
        setBaseEdges([]);
        setSiteServices([]);
        setSelection(null);
        setLabelInput("");
        setNewLoadInput("");
        setFetchState({ loading: false, error: "Select an assigned site." });
        navigate("/denied", { replace: true });
      });
    }
  }, [
    isSuperAdmin,
    selectedSiteCode,
    visibleSiteOptions,
    navigate,
    setNodes,
    setBaseEdges,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSiteListLoading(true);
      try {
        const sites = await listAdminSites();
        if (cancelled) return;
        setSiteOptions(sites);
        setSiteListError(null);
        if (!isSuperAdmin) {
          setSelectedSiteCode((prev) => {
            if (prev && sites.some((site) => site.code === prev)) {
              return prev;
            }
            return sites[0]?.code ?? null;
          });
        }
      } catch (err) {
        console.error("site list error:", err);
        if (!cancelled) {
          setSiteListError("Failed to load site list.");
        }
      } finally {
        if (!cancelled) setSiteListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!selectedSiteCode) return;
    let cancelled = false;
    (async () => {
      setFetchState({ loading: true, error: null });
      setSiteServices([]);
      setNewServiceName("");
      setServiceActionId(null);
      try {
        const topo = await getSiteTopology(selectedSiteCode);
        if (cancelled) return;

        const meta = {
          id: topo.site.id ?? 0,
          code: topo.site.code,
          name: topo.site.name,
        };
        setCurrentSiteMeta(meta);

        let bundle: FlowBundle | null = null;
        if (meta.id) {
          try {
            const draft = await fetchTopologyDraft(meta.id);
            if (!cancelled && draft?.topology) {
              bundle = flowFromDraft(draft.topology as DraftTopology);
            }
          } catch (draftErr) {
            console.error("draft fetch error:", draftErr);
            if (!cancelled) {
              await showErrorToast(
                "Failed to load saved draft. Showing published view."
              );
            }
          }
        }

        if (!bundle) {
          bundle = makeFlowFromTopology(topo);
        }

        setNodes(bundle.nodes);
        setBaseEdges(sanitizeEdges(bundle.edges));
        const servicesList = Array.isArray(topo.services)
          ? topo.services.map((item, idx) => {
              if (!item) return { name: "", sortOrder: idx } as ServiceItem;
              if (typeof item === "string") {
                return {
                  name: item.trim(),
                  sortOrder: idx,
                } as ServiceItem;
              }
              if (typeof item === "object") {
                return {
                  id:
                    typeof (item as any).id === "number"
                      ? Number((item as any).id)
                      : undefined,
                  name:
                    typeof (item as any).name === "string"
                      ? (item as any).name.trim()
                      : "",
                  sortOrder:
                    typeof (item as any).sortOrder === "number"
                      ? Number((item as any).sortOrder)
                      : idx,
                } as ServiceItem;
              }
              return { name: "", sortOrder: idx } as ServiceItem;
            })
          : [];
        setSiteServices(
          sortServiceItems(
            servicesList.filter((svc) => svc.name && svc.name.length > 0)
          )
        );
        setDirty(false);
        setSelection(null);
        setLabelInput("");
        setNewLoadInput("");
        setFetchState({ loading: false, error: null });
      } catch (err) {
        console.error("load topology error:", err);
        if (!cancelled) {
          setFetchState({ loading: false, error: "Failed to load topology." });
          setSiteServices([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSiteCode, setNodes]);

  const selectedSiteOption = useMemo(
    () =>
      selectedSiteCode
        ? visibleSiteOptions.find((site) => site.code === selectedSiteCode) ??
          null
        : null,
    [selectedSiteCode, visibleSiteOptions]
  );

  const groupedSites = useMemo(() => {
    const registry = new Map<
      string,
      { code: string; name: string; sites: AdminSiteSummary[] }
    >();
    regions.forEach((region) => {
      registry.set(region.code, {
        code: region.code,
        name: region.name,
        sites: [],
      });
    });
    visibleSiteOptions.forEach((site) => {
      const code = site.regionCode || "UNASSIGNED";
      const displayName =
        site.regionName ||
        regions.find((region) => region.code === code)?.name ||
        code;
      if (!registry.has(code)) {
        registry.set(code, { code, name: displayName, sites: [] });
      } else if (!registry.get(code)!.name) {
        registry.get(code)!.name = displayName;
      }
      registry.get(code)!.sites.push(site);
    });
    return Array.from(registry.values()).map((entry) => ({
      ...entry,
      sites: entry.sites.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [regions, visibleSiteOptions]);

  const regionGroups = useMemo(() => {
    if (regions.length) {
      return regions.map((region) => {
        const match = groupedSites.find((group) => group.code === region.code);
        return (
          match ?? {
            code: region.code,
            name: region.name,
            sites: [],
          }
        );
      });
    }
    return groupedSites;
  }, [groupedSites, regions]);

  useEffect(() => {
    setExpandedRegions(() => {
      const next: Record<string, boolean> = {};
      groupedSites.forEach((group) => {
        next[group.code] = false;
      });
      return next;
    });
  }, [groupedSites]);

  useEffect(() => {
    if (!sitePickerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [sitePickerOpen]);

  useEffect(() => {
    if (!sitePickerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSitePickerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sitePickerOpen]);

  const toggleRegion = useCallback((code: string) => {
    setExpandedRegions((prev) => {
      const currentlyOpen = !!prev[code];
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        next[key] = false;
      });
      if (!currentlyOpen) {
        next[code] = true;
      }
      return next;
    });
  }, []);

  const handleSiteSelect = useCallback(
    (site: AdminSiteSummary) => {
      setSelectedSiteCode(site.code);
      setSitePickerOpen(false);
      setCreatingSite(false);
    },
    [setCreatingSite]
  );

  useEffect(() => {
    if (!selectedSiteCode) {
      setSiteServices([]);
      setNewServiceName("");
      setServiceActionId(null);
    }
  }, [selectedSiteCode]);

  useEffect(() => {
    setServicesCollapsed(false);
    setServiceMenuId(null);
  }, [selectedSiteCode]);

  useEffect(() => {
    if (!reactFlowInstance) return;
    if (!nodes.length && !viewEdges.length) return;
    const timeout = setTimeout(() => {
      try {
        reactFlowInstance.fitView({ padding: 0.18, duration: 320 });
      } catch (e) {
        console.warn("fitView failed", e);
      }
    }, 40);
    return () => clearTimeout(timeout);
  }, [reactFlowInstance, nodes.length, viewEdges.length]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      rawOnNodesChange(changes);
      if (changes.length) setDirty(true);
      const removed = changes
        .filter((c) => c.type === "remove")
        .map((c) => c.id);
      if (removed.length) {
        setBaseEdges((edges) =>
          edges.filter(
            (edge) =>
              !removed.includes(edge.source) && !removed.includes(edge.target)
          )
        );
      }
    },
    [rawOnNodesChange]
  );

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const sh = normalizeHandleId(connection.sourceHandle);
    const th = normalizeHandleId(connection.targetHandle);
    const id = makeId("edge");
    setBaseEdges((edges) =>
      edges.concat({
        id,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: sh,
        targetHandle: th,
        label: "",
        color: undefined,
        structural: false,
        loads: [],
        labelT: 0.5,
        labelOffset: { x: 0, y: 0 },
      })
    );
    setSelection({ type: "edge", id, loadIndex: -1 });
    setLabelInput("");
    setNewLoadInput("");
    setDirty(true);
  }, []);

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const baseIdsToRemove = new Set<string>();
      changes.forEach((change) => {
        if (change.type === "remove") {
          const baseId = String(change.id).split("::")[0];
          if (
            edgeReconnectSnapshot.current &&
            edgeReconnectSnapshot.current.id === baseId
          ) {
            return;
          }
          baseIdsToRemove.add(baseId);
        }
      });
      if (baseIdsToRemove.size) {
        setBaseEdges((edges) =>
          edges.filter((edge) => !baseIdsToRemove.has(edge.id))
        );
        setDirty(true);
        if (selection?.type === "edge" && baseIdsToRemove.has(selection.id)) {
          setSelection(null);
          setLabelInput("");
          setNewLoadInput("");
        }
        if (hoveredEdgeId && baseIdsToRemove.has(hoveredEdgeId)) {
          setHoveredEdgeId(null);
        }
      }
    },
    [selection, hoveredEdgeId]
  );

  const resolveBaseEdgeId = useCallback((edge: Edge) => {
    const data = edge.data as ViewEdge["data"] | undefined;
    if (data?.baseId) return data.baseId;
    return String(edge.id).split("::")[0];
  }, []);

  const handleReconnectStart = useCallback(
    (_: any, edge: Edge) => {
      edgeReconnectSuccess.current = false;
      const baseId = resolveBaseEdgeId(edge);
      const snapshot = baseEdges.find((item) => item.id === baseId);
      edgeReconnectSnapshot.current = snapshot ? { ...snapshot } : null;
    },
    [baseEdges, resolveBaseEdgeId]
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!newConnection.source || !newConnection.target) return;
      edgeReconnectSuccess.current = true;
      const baseId = resolveBaseEdgeId(oldEdge);
      const sh = normalizeHandleId(newConnection.sourceHandle);
      const th = normalizeHandleId(newConnection.targetHandle);
      setBaseEdges((edges) =>
        edges.map((edge) =>
          edge.id === baseId
            ? {
                ...edge,
                source: newConnection.source!,
                target: newConnection.target!,
                sourceHandle: sh,
                targetHandle: th,
              }
            : edge
        )
      );
      if (selection?.type === "edge" && selection.id === baseId) {
        setSelection({ type: "edge", id: baseId, loadIndex: -1 });
      }
      setDirty(true);
      edgeReconnectSnapshot.current = null;
    },
    [resolveBaseEdgeId, selection]
  );

  const handleReconnectEnd = useCallback(() => {
    if (!edgeReconnectSuccess.current && edgeReconnectSnapshot.current) {
      const snapshot = edgeReconnectSnapshot.current;
      setBaseEdges((edges) =>
        edges.map((edge) => (edge.id === snapshot.id ? snapshot : edge))
      );
    }
    edgeReconnectSnapshot.current = null;
    edgeReconnectSuccess.current = false;
  }, []);

  const handleToggleCreateSite = useCallback(() => {
    if (!isSuperAdmin) return;
    setCreatingSite((prev) => {
      const next = !prev;
      if (!prev && next) {
        setSelectedSiteCode(null);
        setCurrentSiteMeta(null);
        setNodes([]);
        setBaseEdges([]);
        setSiteServices([]);
        setSelection(null);
        setLabelInput("");
        setNewLoadInput("");
        setDirty(false);
      }
      return next;
    });
  }, [isSuperAdmin, setNodes]);

  const handleDeleteSite = useCallback(async () => {
    if (!isSuperAdmin || !currentSiteMeta || currentSiteMeta.id <= 0) return;
    const meta = currentSiteMeta;
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this site?",
      text: `This will permanently remove ${meta.name} and all related topology data.`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      setDeletingSite(true);
      await deleteAdminSite(meta.id);
      setSiteOptions((opts) => opts.filter((opt) => opt.id !== meta.id));
      setHiddenSiteIds((prev) => prev.filter((id) => id !== meta.id));
      setPendingManagerSite((prev) =>
        prev && prev.id === meta.id ? null : prev
      );
      setSelectedSiteCode(null);
      setCurrentSiteMeta(null);
      setNodes([]);
      setBaseEdges([]);
      setSiteServices([]);
      setSelection(null);
      setLabelInput("");
      setNewLoadInput("");
      setDirty(false);
      await showSuccessToast("Site deleted");
    } catch (err: any) {
      console.error("delete site error:", err);
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.message || "Unable to delete site.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setDeletingSite(false);
    }
  }, [
    currentSiteMeta,
    setSiteOptions,
    setSelectedSiteCode,
    setCurrentSiteMeta,
    setNodes,
    setBaseEdges,
    setSiteServices,
    setSelection,
    setLabelInput,
    setNewLoadInput,
    setDirty,
  ]);

  const handleAddNode = useCallback(() => {
    const id = makeId("node");
    const base = reactFlowInstance
      ? reactFlowInstance.project({ x: 200, y: 150 })
      : { x: 200, y: 150 };
    const widthVal = 190;
    const heightVal = 80;
    const newNode: Node = {
      id,
      type: "topology",
      data: {
        label: "New Node",
        kind: "node",
        style: SECONDARY_NODE_STYLE,
      },
      position: {
        x: base.x + nodes.length * 24,
        y: base.y + nodes.length * 24,
      },
      width: widthVal,
      height: heightVal,
      style: { width: widthVal, height: heightVal },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelection({ type: "node", id });
    setLabelInput("New Node");
    setDirty(true);
  }, [nodes.length, reactFlowInstance, setNodes]);

  const handleAddStandalone = useCallback(() => {
    const id = makeId("label");
    const base = reactFlowInstance
      ? reactFlowInstance.project({ x: 260, y: 200 })
      : { x: 260, y: 200 };
    const widthVal = 200;
    const heightVal = 70;
    const newNode: Node = {
      id,
      type: "topology",
      data: {
        label: "Standalone",
        kind: "label",
        style: {
          ...SECONDARY_NODE_STYLE,
          background: "#1e293b",
          color: "#e2e8f0",
        },
      },
      position: { x: base.x, y: base.y },
      width: widthVal,
      height: heightVal,
      style: { width: widthVal, height: heightVal },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelection({ type: "node", id });
    setLabelInput("Standalone");
    setDirty(true);
  }, [reactFlowInstance, setNodes]);

  const handleAddService = useCallback(async () => {
    const trimmed = newServiceName.trim();
    if (!currentSiteMeta?.id || currentSiteMeta.id <= 0) {
      await Swal.fire({
        icon: "info",
        title: "Select a site",
        text: "Choose or create a site before adding services.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (!trimmed) {
      await Swal.fire({
        icon: "warning",
        title: "Service name required",
        text: "Enter the service or capability provided by this site.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    try {
      setAddingService(true);
      const nextOrder = siteServices.length;
      const created = await addSiteService(currentSiteMeta.id, {
        name: trimmed,
        sortOrder: nextOrder,
      });
      setSiteServices((prev) =>
        sortServiceItems(
          prev.concat({
            id: created.id,
            name: created.name,
            sortOrder:
              typeof created.sortOrder === "number"
                ? created.sortOrder
                : nextOrder,
          })
        )
      );
      setNewServiceName("");
      await showSuccessToast("Service added");
    } catch (err: any) {
      console.error("add service error:", err);
      await Swal.fire({
        icon: "error",
        title: "Add service failed",
        text: err?.message || "Unable to add site service.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setAddingService(false);
    }
  }, [currentSiteMeta, newServiceName, siteServices.length]);

  const handleEditService = useCallback(
    async (svc: ServiceItem) => {
      if (!currentSiteMeta?.id || currentSiteMeta.id <= 0) {
        await Swal.fire({
          icon: "info",
          title: "Select a site",
          text: "Choose a site before editing its services.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      if (!svc.id) {
        await Swal.fire({
          icon: "info",
          title: "Read-only service",
          text: "This service cannot be edited from the builder.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      const { value, isConfirmed } = await Swal.fire({
        icon: "question",
        title: "Rename service",
        input: "text",
        inputLabel: "Service name",
        inputValue: svc.name,
        showCancelButton: true,
        confirmButtonText: "Save",
        confirmButtonColor: "#2563eb",
        cancelButtonText: "Cancel",
        inputValidator: (val) =>
          !val?.trim() ? "Service name cannot be empty." : null,
      });
      if (!isConfirmed) return;
      const trimmed = (value ?? "").trim();
      if (!trimmed || trimmed === svc.name) return;
      try {
        setServiceActionId(svc.id);
        const updated = await updateSiteService(currentSiteMeta.id, svc.id, {
          name: trimmed,
        });
        setSiteServices((prev) =>
          sortServiceItems(
            prev.map((item) =>
              item.id === svc.id
                ? {
                    ...item,
                    name: updated.name,
                    sortOrder:
                      typeof updated.sortOrder === "number"
                        ? updated.sortOrder
                        : item.sortOrder,
                  }
                : item
            )
          )
        );
        await showSuccessToast("Service updated");
      } catch (err: any) {
        console.error("update service error:", err);
        await Swal.fire({
          icon: "error",
          title: "Update failed",
          text: err?.message || "Unable to update service.",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setServiceActionId(null);
      }
    },
    [currentSiteMeta]
  );

  const handleDeleteService = useCallback(
    async (svc: ServiceItem) => {
      if (!currentSiteMeta?.id || currentSiteMeta.id <= 0) {
        await Swal.fire({
          icon: "info",
          title: "Select a site",
          text: "Choose a site before deleting services.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      if (!svc.id) {
        await Swal.fire({
          icon: "info",
          title: "Read-only service",
          text: "This service cannot be deleted from the builder.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      const confirm = await Swal.fire({
        icon: "warning",
        title: "Remove service?",
        text: `This will delete "${svc.name}" from ${currentSiteMeta.name}.`,
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#ef4444",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });
      if (!confirm.isConfirmed) return;
      try {
        setServiceActionId(svc.id);
        await deleteSiteService(currentSiteMeta.id, svc.id);
        setSiteServices((prev) => prev.filter((item) => item.id !== svc.id));
        await showSuccessToast("Service removed");
      } catch (err: any) {
        console.error("delete service error:", err);
        await Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: err?.message || "Unable to delete service.",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setServiceActionId(null);
      }
    },
    [currentSiteMeta]
  );

  const selectedNode =
    selection?.type === "node"
      ? nodes.find((n) => n.id === selection.id) || null
      : null;
  const selectedNodeKind = selectedNode
    ? (nodeData(selectedNode)?.kind as string | undefined) || "node"
    : "node";
  const selectedEdge =
    selection?.type === "edge"
      ? baseEdges.find((edge) => edge.id === selection.id) || null
      : null;

  useEffect(() => {
    if (selectedNode) {
      const data = nodeData(selectedNode);
      setLabelInput(typeof data?.label === "string" ? data.label : "");
      setNewLoadInput("");
    } else if (selectedEdge) {
      if (selection?.type === "edge" && selection.loadIndex >= 0) {
        setLabelInput(selectedEdge.loads[selection.loadIndex] || "");
      } else {
        setLabelInput(selectedEdge.label ?? "");
      }
    } else {
      setLabelInput("");
      setNewLoadInput("");
    }
    setSelectedLoadOptions([]);
  }, [selectedNode, selectedEdge, selection]);

  const handleLabelInputChange = useCallback(
    (value: string) => {
      setLabelInput(value || "");
      if (selection?.type === "node") {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selection.id
              ? {
                  ...node,
                  data: { ...(nodeData(node) ?? {}), label: value },
                }
              : node
          )
        );
        if (selectedNodeKind === "core") {
          setCurrentSiteMeta((prev) =>
            prev ? { ...prev, name: value } : prev
          );
          setSiteOptions((opts) =>
            opts.map((opt) =>
              opt.code === selection.id
                ? { ...opt, name: value || opt.name }
                : opt
            )
          );
        }
        setDirty(true);
        return;
      }
      if (selection?.type === "edge" && selectedEdge) {
        if (selection.loadIndex >= 0 && !selectedEdge.structural) {
          setBaseEdges((edges) =>
            edges.map((edge) =>
              edge.id === selectedEdge.id
                ? {
                    ...edge,
                    loads: edge.loads.map((load, idx) =>
                      idx === selection.loadIndex ? value : load
                    ),
                  }
                : edge
            )
          );
        } else {
          setBaseEdges((edges) =>
            edges.map((edge) =>
              edge.id === selectedEdge.id ? { ...edge, label: value } : edge
            )
          );
        }
        setDirty(true);
      }
    },
    [selection, selectedEdge, setNodes, selectedNodeKind]
  );

  const commitSiteName = useCallback(
    (value: string) => {
      if (!currentSiteMeta) return;
      const trimmedName = value.trim();
      const trimmedCode = trimmedName.toUpperCase();
      if (!trimmedName) return;

      const oldCode = currentSiteMeta.code;
      const newCode = trimmedCode;

      setCurrentSiteMeta((prev) =>
        prev ? { ...prev, name: trimmedName, code: newCode } : prev
      );
      setSiteOptions((opts) =>
        opts.map((opt) =>
          opt.code === oldCode ? { ...opt, name: trimmedName, code: newCode } : opt
        )
      );
      setNodes((nds) =>
        nds.map((node) =>
          node.id === oldCode
            ? {
                ...node,
                id: newCode,
                data: { ...(nodeData(node) ?? {}), label: trimmedName },
              }
            : node
        )
      );
      setBaseEdges((edges) =>
        edges.map((edge) => {
          let changed = false;
          const next: any = { ...edge };
          if (edge.source === oldCode) {
            next.source = newCode;
            changed = true;
          }
          if (edge.target === oldCode) {
            next.target = newCode;
            changed = true;
          }
          return changed ? next : edge;
        })
      );
      if (selection?.type === "node" && selection.id === oldCode) {
        setSelection({ type: "node", id: newCode });
      }
      setSelectedSiteCode(newCode);
      setDirty(true);
    },
    [currentSiteMeta, selection, setNodes, setBaseEdges]
  );

  const handleAddLoad = useCallback(() => {
    if (!selectedEdge || selectedEdge.structural) return;
    const trimmed = newLoadInput.trim();
    if (!trimmed) return;
    setBaseEdges((edges) =>
      edges.map((edge) =>
        edge.id === selectedEdge.id
          ? { ...edge, loads: edge.loads.concat(trimmed), structural: false }
          : edge
      )
    );
    setNewLoadInput("");
    setDirty(true);
    upsertLoadTagOption(trimmed);
  }, [newLoadInput, selectedEdge, upsertLoadTagOption]);

  const handleRemoveLoad = useCallback(
    (edgeId: string, loadIndex: number) => {
      setBaseEdges((edges) =>
        edges.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                loads: edge.loads.filter((_, idx) => idx !== loadIndex),
              }
            : edge
        )
      );
      setDirty(true);
      if (
        selection?.type === "edge" &&
        selection.id === edgeId &&
        selection.loadIndex === loadIndex
      ) {
        setSelection({ type: "edge", id: edgeId, loadIndex: -1 });
        setLabelInput(selectedEdge?.label ?? "");
      }
    },
    [selectedEdge, selection]
  );

  const handleToggleLoadOption = useCallback((tag: string) => {
    setSelectedLoadOptions((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : prev.concat(tag)
    );
  }, []);

  const handleApplySelectedLoadOptions = useCallback(() => {
    if (!selectedEdge || selectedEdge.structural) return;
    if (!selectedLoadOptions.length) return;
    const normalized = selectedLoadOptions
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (!normalized.length) return;
    const existing = new Set(
      selectedEdge.loads.map((load) => load.toLowerCase())
    );
    const additions = normalized.filter(
      (tag) => !existing.has(tag.toLowerCase())
    );
    if (!additions.length) {
      setSelectedLoadOptions([]);
      return;
    }
    additions.forEach((tag) => upsertLoadTagOption(tag));
    setBaseEdges((edges) =>
      edges.map((edge) =>
        edge.id === selectedEdge.id
          ? {
              ...edge,
              structural: false,
              loads: edge.loads.concat(additions),
            }
          : edge
      )
    );
    setSelectedLoadOptions([]);
    setDirty(true);
  }, [selectedEdge, selectedLoadOptions, upsertLoadTagOption]);

  const handleToggleStructural = useCallback(() => {
    if (!selectedEdge) return;
    setBaseEdges((edges) =>
      edges.map((edge) =>
        edge.id === selectedEdge.id
          ? {
              ...edge,
              structural: !edge.structural,
              loads: !edge.structural ? [] : edge.loads,
            }
          : edge
      )
    );
    setSelection({ type: "edge", id: selectedEdge.id, loadIndex: -1 });
    setLabelInput(selectedEdge.label ?? "");
    setDirty(true);
  }, [selectedEdge]);

  const handleDeleteSelection = useCallback(() => {
    if (!selection) return;
    if (selection.type === "node") {
      setNodes((nds) => nds.filter((n) => n.id !== selection.id));
      setBaseEdges((edges) =>
        edges.filter(
          (edge) => edge.source !== selection.id && edge.target !== selection.id
        )
      );
    } else if (selection.type === "edge") {
      if (selection.loadIndex >= 0) {
        setBaseEdges((edges) =>
          edges.map((edge) =>
            edge.id === selection.id
              ? {
                  ...edge,
                  loads: edge.loads.filter(
                    (_, idx) => idx !== selection.loadIndex
                  ),
                }
              : edge
          )
        );
      } else {
        setBaseEdges((edges) =>
          edges.filter((edge) => edge.id !== selection.id)
        );
      }
    }
    setSelection(null);
    setLabelInput("");
    setNewLoadInput("");
    setDirty(true);
  }, [selection, setNodes]);

  const handleSaveDraft = useCallback(async () => {
    if (!currentSiteMeta || currentSiteMeta.id <= 0) return;
    try {
      setSaving(true);
      const normalizedNodes = withEnsuredNodeLabels(nodes);
      const topology = serializeDraft(normalizedNodes, baseEdges);
      await saveTopologyDraft(currentSiteMeta.id, topology, {
        code: currentSiteMeta.code,
        name: currentSiteMeta.name,
        updatedAt: Date.now(),
      });
      setDirty(false);
      await showSuccessToast("Draft saved");
    } catch (err) {
      console.error("save draft error:", err);
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Failed to save draft. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  }, [currentSiteMeta, nodes, baseEdges]);

  const handlePublish = useCallback(async () => {
    if (!currentSiteMeta || currentSiteMeta.id <= 0) return;
    try {
      setPublishing(true);
      const normalizedNodes = withEnsuredNodeLabels(nodes);
      const topology = serializeDraft(normalizedNodes, baseEdges);
      await publishTopology(currentSiteMeta.id, topology, {
        code: currentSiteMeta.code,
        name: currentSiteMeta.name,
        updatedAt: Date.now(),
      });
      setDirty(false);
      await showSuccessToast("Topology published");
    } catch (err: any) {
      console.error("publish topology error:", err);
      await Swal.fire({
        icon: "error",
        title: "Publish failed",
        text: err?.message || "Failed to publish topology.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setPublishing(false);
    }
  }, [currentSiteMeta, nodes, baseEdges]);

  const proOptions = useMemo(
    () => ({ account: "cnfm", hideAttribution: true }),
    []
  );

  const handleCreateSite = useCallback(async () => {
    if (!isSuperAdmin) return;
    const trimmedName = createSiteForm.name.trim();
    if (!trimmedName) return;
    const code = trimmedName.toUpperCase();
    try {
      const newSite = await createAdminSite({
        code,
        name: trimmedName,
        regionCode: createSiteForm.regionCode,
      });
      const regionLabel =
        regions.find((r) => r.code === newSite.regionCode)?.name ??
        newSite.regionCode;
      setSiteOptions((opts) =>
        opts.concat({
          ...newSite,
          regionName: regionLabel,
        })
      );
      setHiddenSiteIds((prev) =>
        prev.includes(newSite.id) ? prev : prev.concat(newSite.id)
      );
      setPendingManagerSite({
        id: newSite.id,
        code: newSite.code,
        name: newSite.name,
      });
      setSelectedSiteCode(newSite.code);
      setCurrentSiteMeta({
        id: newSite.id,
        code: newSite.code,
        name: newSite.name,
      });
      const rootNode: Node = {
        id: newSite.code,
        type: "topology",
        data: {
          label: newSite.name,
          kind: "core",
          style: DEFAULT_NODE_STYLE,
        },
        position: { x: 200, y: 200 },
        width: 200,
        height: 90,
      };
      setNodes([rootNode]);
      setBaseEdges([]);
      setSiteServices([]);
      setNewServiceName("");
      setDirty(true);
      setCreatingSite(false);
      setCreateSiteForm((prev) => ({ ...prev, name: "" }));
    } catch (err: any) {
      const message = err?.message || "Failed to create site.";
      if (message.toLowerCase().includes("exist")) {
        await showErrorToast(message);
      } else {
        alert(message);
      }
    }
  }, [createSiteForm, regions]);

  const handleSelectLoad = useCallback((edgeId: string, loadIndex: number) => {
    setSelection({ type: "edge", id: edgeId, loadIndex });
  }, []);

  const statusMessages = useMemo(() => {
    const list: Array<{ text: string; tone: "info" | "error" }> = [];
    if (siteListLoading) {
      list.push({ text: "Loading sites…", tone: "info" });
    }
    if (siteListError) {
      list.push({ text: siteListError, tone: "error" });
    }
    if (fetchState.loading) {
      list.push({ text: "Loading topology…", tone: "info" });
    }
    if (fetchState.error) {
      list.push({ text: fetchState.error, tone: "error" });
    }
    return list;
  }, [siteListLoading, siteListError, fetchState.loading, fetchState.error]);

  const inspectorTitle = useMemo(() => {
    if (!selection) return "";
    if (selection.type === "node") {
      return selection.id;
    }
    if (selection.type === "edge" && selectedEdge) {
      if (selection.loadIndex >= 0 && !selectedEdge.structural) {
        const loadLabel = selectedEdge.loads[selection.loadIndex] ?? "";
        if (loadLabel.trim().length) return loadLabel;
      }
      if (selectedEdge.label && selectedEdge.label.trim().length) {
        return selectedEdge.label;
      }
      return selectedEdge.id;
    }
    return "";
  }, [selection, selectedEdge]);

  useEffect(() => {
    if (serviceMenuId === null) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".service-item-menu")) {
        setServiceMenuId(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [serviceMenuId]);

  return (
    <div className={`topology-editor-shell ${connecting ? "connecting" : ""}`}>
      <header className="editor-header">
        <div className="editor-heading">
          <img
            src="/CNFM%20Logo.png"
            alt="CNFM"
            className="editor-logo"
            width={32}
            height={32}
          />
          <p className="editor-eyebrow accent">Topology Builder</p>
        </div>
        <div className="editor-site-controls inline">
          {isSuperAdmin || (visibleSiteOptions.length > 1 && !isSuperAdmin) ? (
            <button
              type="button"
              className="editor-site-button capsule compact viewer-select-btn"
              onClick={() => setSitePickerOpen(true)}
              disabled={siteListLoading && !visibleSiteOptions.length}
            >
              <span className="title">
                {selectedSiteOption
                  ? selectedSiteOption.name
                  : "Select Site Here"}
              </span>
              <span className="editor-site-button-caret" aria-hidden="true">
                ▾
              </span>
            </button>
          ) : (
            <div className="editor-assigned-pill">
              <span className="label">Assigned site:</span>
              <span className="code">
                {selectedSiteOption ? selectedSiteOption.name : "Unassigned"}
              </span>
              <span className="separator" aria-hidden>
                •
              </span>
              <span className="region">
                {selectedSiteOption
                  ? selectedSiteOption.regionName ||
                    selectedSiteOption.regionCode ||
                    "Unassigned region"
                  : "No region"}
              </span>
            </div>
          )}
          {statusMessages.length > 0 && (
            <ul className="editor-status-list">
              {statusMessages.map((msg, idx) => (
                <li key={idx} className={`editor-status-flag ${msg.tone}`}>
                  {msg.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {pendingManagerSite && (
        <div className="assignment-banner">
          <div className="assignment-banner-text">
            <p className="assignment-banner-title">Assign a site manager</p>
            <p>
              {pendingManagerSite.name} is hidden from the site picker until at
              least one manager is assigned. Use the Users page to grant access
              and then refresh this list.
            </p>
          </div>
          <div className="assignment-banner-actions">
            <button
              type="button"
              className="editor-btn secondary"
              onClick={handleAssignManagerNow}
            >
              Go to Users
            </button>
            <button
              type="button"
              className="editor-btn primary"
              onClick={handleConfirmManagerAssignment}
            >
              Refresh site list
            </button>
          </div>
        </div>
      )}

      <div className="editor-toolbar" role="toolbar">
        <div className="toolbar-group">
          {isSuperAdmin && (
            <button
              type="button"
              className="editor-btn secondary"
              onClick={handleToggleCreateSite}
            >
              <span className="btn-icon">
                <IconPlus />
              </span>
              <span>{creatingSite ? "Close new site" : "New site"}</span>
            </button>
          )}
          {isSuperAdmin && (
            <button
              type="button"
              className="editor-btn danger"
              onClick={handleDeleteSite}
              disabled={
                deletingSite || !currentSiteMeta || currentSiteMeta.id <= 0
              }
            >
              <span className="btn-icon">
                <IconTrash />
              </span>
              <span>{deletingSite ? "Deleting…" : "Delete site"}</span>
            </button>
          )}
          <button
            type="button"
            className="editor-btn secondary"
            onClick={handleAddNode}
            disabled={!selectedSiteCode}
          >
            <span className="btn-icon">
              <IconNodes />
            </span>
            <span>Add node</span>
          </button>
          <button
            type="button"
            className="editor-btn secondary"
            onClick={handleAddStandalone}
            disabled={!selectedSiteCode}
          >
            <span className="btn-icon">
              <IconBlock />
            </span>
            <span>Standalone block</span>
          </button>
        </div>
        <div className="toolbar-divider" aria-hidden />
        <div className="toolbar-group">
          <button
            type="button"
            className="editor-btn secondary"
            onClick={handleDeleteSelection}
            disabled={!selection}
          >
            <span className="btn-icon">
              <IconDeleteSelection />
            </span>
            <span>Delete selection</span>
          </button>
          <button
            type="button"
            className="editor-btn secondary"
            onClick={handleSaveDraft}
            disabled={
              saving || !dirty || !currentSiteMeta || currentSiteMeta.id <= 0
            }
          >
            <span className="btn-icon">
              <IconSave />
            </span>
            <span>
              {saving ? "Saving…" : dirty ? "Save draft" : "Draft saved"}
            </span>
          </button>
          <button
            type="button"
            className="editor-btn primary"
            onClick={handlePublish}
            disabled={publishing || !currentSiteMeta || currentSiteMeta.id <= 0}
          >
            <span className="btn-icon">
              <IconPublish />
            </span>
            <span>{publishing ? "Publishing…" : "Publish"}</span>
          </button>
        </div>
      </div>
      {creatingSite && (
        <section
          className="editor-card editor-create-card"
          aria-label="Create new site"
        >
          <div className="editor-card-header">
            <h2>Create new site</h2>
          </div>
          <div className="create-grid">
            <label>
              <span>Name</span>
              <input
                type="text"
                value={createSiteForm.name}
                onChange={(e) =>
                  setCreateSiteForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Site name"
              />
            </label>
            <label>
              <span>Region</span>
              <select
                value={createSiteForm.regionCode}
                onChange={(e) =>
                  setCreateSiteForm((prev) => ({
                    ...prev,
                    regionCode: e.target.value,
                  }))
                }
              >
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="create-actions">
            <button
              type="button"
              className="editor-btn primary"
              onClick={handleCreateSite}
            >
              Create site
            </button>
          </div>
        </section>
      )}

      <div className="editor-main">
        <div className="editor-canvas">
          <ReactFlow
            nodes={nodes}
            edges={viewEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            nodesConnectable
            connectionMode={ConnectionMode.Loose}
            connectOnClick
            reconnectRadius={26}
            edgesUpdatable
            defaultEdgeOptions={{ reconnectable: true }}
            isValidConnection={(c) =>
              !!c.source && !!c.target && c.source !== c.target
            }
            onConnectStart={() => setConnecting(true)}
            onConnectEnd={() => setConnecting(false)}
            onNodeClick={(_, node) =>
              setSelection({ type: "node", id: node.id })
            }
            onEdgeClick={(_, edge) => {
              const data = edge.data as ViewEdge["data"] | undefined;
              if (!data) return;
              setSelection({
                type: "edge",
                id: data.baseId,
                loadIndex: data.loadIndex,
              });
            }}
            onPaneClick={() => setSelection(null)}
            onInit={setReactFlowInstance}
            fitView
            className="cnfm-flow"
            proOptions={proOptions}
            onReconnectStart={handleReconnectStart}
            onReconnect={handleReconnect}
            onReconnectEnd={handleReconnectEnd}
          >
            <Controls showInteractive={false} />
            <Background
              id="cnfm-grid"
              color="#1e293b"
              gap={18}
              size={1}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>

          {!selectedSiteCode && (
            <div className="canvas-empty">
              {isSuperAdmin ? (
                <>
                  <p>Select a site to begin editing.</p>
                  <p>
                    Use the “Select site” button to load an existing draft or
                    choose “New site” to start from scratch.
                  </p>
                </>
              ) : (
                <>
                  <p>No site has been assigned to your account yet.</p>
                  <p>Please contact a Super Admin to request access.</p>
                </>
              )}
            </div>
          )}

          {!fetchState.loading &&
            selectedSiteCode &&
            !nodes.length &&
            !viewEdges.length && (
              <div className="canvas-empty">
                <p>No topology data loaded for this site yet.</p>
                <p>Use the builder tools to start drafting a layout.</p>
              </div>
            )}
        </div>

        <aside className="editor-sidebar">
          <section className="editor-card editor-services">
            <button
              type="button"
              className="service-card-toggle"
              onClick={() => setServicesCollapsed((prev) => !prev)}
              aria-expanded={!servicesCollapsed}
              aria-controls="service-card-content"
            >
              <div className="service-card-header">
                <h2>Site Services</h2>
                <span className="badge">SERVICES</span>
              </div>
              <span
                className={`service-card-caret ${
                  servicesCollapsed ? "" : "open"
                }`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <div
              id="service-card-content"
              className={`service-card-body ${
                servicesCollapsed ? "collapsed" : ""
              }`}
              aria-hidden={servicesCollapsed}
            >
              {currentSiteMeta ? (
                <>
                  {siteServices.length ? (
                    <ul className="service-list">
                      {siteServices.map((svc, idx) => {
                        const menuKey = svc.id ?? `${svc.name}-${idx}`;
                        return (
                          <li
                            key={`${svc.id ?? svc.name}-${idx}`}
                            className="service-item"
                          >
                            <div className="service-content">
                              <span className="service-bullet" aria-hidden>
                                ●
                              </span>
                              <span className="service-name">{svc.name}</span>
                            </div>
                            {svc.id ? (
                              <div className="service-actions">
                                <button
                                  type="button"
                                  className="service-menu-trigger service-item-menu"
                                  aria-haspopup="true"
                                  aria-expanded={serviceMenuId === menuKey}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setServiceMenuId((prev) =>
                                      prev === menuKey ? null : menuKey
                                    );
                                  }}
                                >
                                  <span aria-hidden="true">⋮</span>
                                </button>
                                {serviceMenuId === menuKey && (
                                  <div className="service-menu service-item-menu">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleEditService(svc);
                                        setServiceMenuId(null);
                                      }}
                                      disabled={
                                        serviceActionId === svc.id ||
                                        addingService
                                      }
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="danger"
                                      onClick={() => {
                                        handleDeleteService(svc);
                                        setServiceMenuId(null);
                                      }}
                                      disabled={
                                        serviceActionId === svc.id ||
                                        addingService
                                      }
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="detail-empty">
                      No services recorded yet. Add the offerings supported by
                      this site.
                    </p>
                  )}
                  <div className="add-service-row">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                      placeholder="e.g. 2G, 4G, LTE, 5G: DATA, SMS, VOICE"
                      disabled={
                        addingService ||
                        serviceActionId !== null ||
                        !currentSiteMeta
                      }
                    />
                    <button
                      type="button"
                      className="add-service-btn"
                      onClick={handleAddService}
                      disabled={
                        addingService ||
                        serviceActionId !== null ||
                        !currentSiteMeta
                      }
                    >
                      {addingService ? "Adding…" : "Add service"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="detail-hint">
                  Select a site to view and manage its services.
                </p>
              )}
            </div>
          </section>

          <section className="editor-card editor-inspector">
            <div className="editor-card-header">
              <h2>Inspector</h2>
              {selection ? (
                <span className="badge">
                  {selection.type === "node"
                    ? "NODE"
                    : selectedEdge?.structural
                    ? "STRUCTURAL"
                    : "EDGE"}
                </span>
              ) : null}
            </div>
            {selection ? (
              selection.type === "node" && selectedNode ? (
                <>
                  <div className="inspector-meta">
                    <h3>{inspectorTitle}</h3>
                    <p>
                      Adjust the node label to update how it appears in the
                      topology canvas. For the core site node, label updates
                      also update the site name/code for the draft; it will be
                      persisted when you save or publish.
                    </p>
                  </div>
                  <label className="detail-field">
                    <span>Label</span>
                    <input
                      type="text"
                      value={labelInput}
                      onChange={(e) => handleLabelInputChange(e.target.value)}
                      onBlur={() => {
                        if (selectedNodeKind === "core") {
                          commitSiteName(labelInput);
                        }
                      }}
                    />
                  </label>
                </>
              ) : selection.type === "edge" && selectedEdge ? (
                <>
                  <div className="inspector-meta">
                    <h3>{inspectorTitle}</h3>
                    <p>
                      Configure loads and behaviour for this connection.
                      Structural links do not carry loads.
                    </p>
                  </div>
                  <label className="detail-field">
                    <span>Base label</span>
                    <input
                      type="text"
                      value={
                        selection.loadIndex >= 0 && !selectedEdge.structural
                          ? selectedEdge.label ?? ""
                          : labelInput
                      }
                      onChange={(e) => handleLabelInputChange(e.target.value)}
                      disabled={
                        selection.loadIndex >= 0 && !selectedEdge.structural
                      }
                    />
                  </label>
                  <label className="detail-switch">
                    <input
                      type="checkbox"
                      checked={!!selectedEdge.structural}
                      onChange={handleToggleStructural}
                    />
                    <span>Structural line (no loads)</span>
                  </label>
                  <label className="detail-switch">
                    <input
                      type="checkbox"
                      checked={!!selectedEdge.animated}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setBaseEdges((edges) =>
                          edges.map((edge) =>
                            edge.id === selectedEdge.id
                              ? { ...edge, animated: val }
                              : edge
                          )
                        );
                        setDirty(true);
                      }}
                    />
                    <span>Animated edge</span>
                  </label>
                  <div className="detail-field">
                    <span>Edge type</span>
                    <select
                      value={selectedEdge.type || "smoothstep"}
                      onChange={(e) => {
                        const v = e.target.value as BaseEdge["type"];
                        setBaseEdges((edges) =>
                          edges.map((edge) =>
                            edge.id === selectedEdge.id
                              ? { ...edge, type: v }
                              : edge
                          )
                        );
                        setDirty(true);
                      }}
                    >
                      <option value="smoothstep">Smoothstep</option>
                      <option value="straight">Straight</option>
                      <option value="step">Step</option>
                      <option value="bezier">Bezier</option>
                    </select>
                  </div>
                  <div className="detail-separator" aria-hidden="true" />
                  {!selectedEdge.structural && (
                    <>
                      <div className="detail-field">
                        <div className="load-option-header">
                          <div>
                            <span>Select existing loads</span>
                            <p>Reuse previously added load tags.</p>
                          </div>
                        </div>
                        {loadTagOptions.length > 0 && (
                          <>
                            <div className="load-option-filter" role="search">
                              <span
                                className="load-option-filter-icon"
                                aria-hidden="true"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  focusable="false"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.94.94l.27.28v.79L20 21.5 21.5 20l-6-6zM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                              <input
                                ref={loadFilterInputRef}
                                type="search"
                                value={loadTagFilter}
                                onChange={(e) =>
                                  setLoadTagFilter(e.target.value)
                                }
                                placeholder="Search loads"
                                aria-label="Search load tags"
                                autoComplete="off"
                              />
                              {loadTagFilter ? (
                                <button
                                  type="button"
                                  className="load-option-filter-clear"
                                  onClick={() => {
                                    setLoadTagFilter("");
                                    loadFilterInputRef.current?.focus();
                                  }}
                                  aria-label="Clear search"
                                >
                                  <span aria-hidden="true">×</span>
                                </button>
                              ) : null}
                            </div>
                            <div
                              className="load-option-divider"
                              aria-hidden="true"
                            />
                          </>
                        )}
                        {loadTagOptions.length ? (
                          <>
                            <div className="load-option-grid">
                              {filteredLoadOptions.length ? (
                                filteredLoadOptions.map((tag) => {
                                  const assigned = selectedEdge.loads.some(
                                    (load) =>
                                      load.toLowerCase() === tag.toLowerCase()
                                  );
                                  const checked =
                                    selectedLoadOptions.includes(tag);
                                  return (
                                    <label
                                      key={`load-option-${tag}`}
                                      className={`load-option ${
                                        checked ? "checked" : ""
                                      } ${assigned ? "disabled" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        disabled={assigned}
                                        checked={checked}
                                        onChange={() =>
                                          handleToggleLoadOption(tag)
                                        }
                                      />
                                      <span>{tag}</span>
                                    </label>
                                  );
                                })
                              ) : (
                                <p className="detail-hint">
                                  No load tags match “{loadTagFilter}”.
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="editor-btn secondary"
                              onClick={handleApplySelectedLoadOptions}
                              disabled={
                                !selectedLoadOptions.length || !selectedEdge
                              }
                            >
                              Add selected loads
                            </button>
                          </>
                        ) : (
                          <p className="detail-hint">
                            Saved load tags will appear here after you add loads
                            in the builder.
                          </p>
                        )}
                      </div>
                      <div className="detail-loads">
                        <div className="load-chip-header">
                          <span>Loads on this edge</span>
                          <small>
                            {selectedEdge.loads.length
                              ? `${selectedEdge.loads.length} total`
                              : "No loads yet"}
                          </small>
                        </div>
                        {selectedEdge.loads.length ? (
                          selectedEdge.loads.map((load, idx) => (
                            <button
                              type="button"
                              key={`${selectedEdge.id}-load-${idx}`}
                              className={
                                selection.loadIndex === idx
                                  ? "load-chip active"
                                  : "load-chip"
                              }
                              onClick={() => {
                                handleSelectLoad(selectedEdge.id, idx);
                                setLabelInput(load);
                              }}
                            >
                              {load}
                              <span
                                className="chip-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveLoad(selectedEdge.id, idx);
                                }}
                              >
                                ×
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="detail-hint">
                            No loads assigned yet. Select existing tags above or
                            add a custom entry below.
                          </p>
                        )}
                      </div>
                      <div className="detail-field">
                        <span>Add custom load</span>
                        <div className="add-load-row">
                          <input
                            type="text"
                            value={newLoadInput}
                            onChange={(e) => setNewLoadInput(e.target.value)}
                            placeholder="e.g. DWDM LAYER"
                          />
                          <button
                            type="button"
                            className="editor-btn secondary"
                            onClick={handleAddLoad}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null
            ) : (
              <p className="detail-empty">
                Select a node or edge to edit labels and loads. Use "Add node"
                or "Standalone block" to recreate infrastructure boxes (IPCORE,
                CORE NEs, etc.).
              </p>
            )}
          </section>
        </aside>
      </div>

      {sitePickerOpen && (
        <div className="editor-modal">
          <div
            className="editor-modal-backdrop"
            onClick={() => setSitePickerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="editor-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="editor-modal-header">
              <h2 id="site-picker-title">Select site</h2>
              <button
                type="button"
                className="editor-modal-close"
                onClick={() => setSitePickerOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="editor-modal-sub">
              Browse available sites grouped by region.
            </p>
            <div className="site-picker-summary">
              <span>
                {visibleSiteOptions.length} total site
                {visibleSiteOptions.length === 1 ? "" : "s"}
              </span>
              {selectedSiteOption ? (
                <span className="current">
                  Current: {selectedSiteOption.name} ·{" "}
                  {selectedSiteOption.regionName ||
                    selectedSiteOption.regionCode}
                </span>
              ) : (
                <span className="current hint">No site selected</span>
              )}
            </div>
            <div className="editor-modal-body">
              {siteListError ? (
                <p className="editor-modal-error">{siteListError}</p>
              ) : null}
              {regionGroups.map((group) => {
                const isOpen = !!expandedRegions[group.code];
                const regionId = `region-${group.code}`;
                const listId = `${regionId}-sites`;
                return (
                  <section
                    key={group.code}
                    className={`site-picker-section ${
                      isOpen ? "open" : "closed"
                    }`}
                  >
                    <button
                      type="button"
                      className="site-picker-toggle"
                      onClick={() => toggleRegion(group.code)}
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      id={regionId}
                    >
                      <span className="region-name">
                        {group.name || group.code}
                      </span>
                      <span className="region-count">
                        {group.sites.length
                          ? `${group.sites.length} site${
                              group.sites.length === 1 ? "" : "s"
                            }`
                          : "No sites"}
                      </span>
                      <span className="region-caret" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        className="site-picker-list"
                        id={listId}
                        role="region"
                        aria-labelledby={regionId}
                      >
                        {group.sites.length ? (
                          group.sites.map((site) => (
                            <button
                              type="button"
                              key={site.id}
                              className={`site-picker-item ${
                                selectedSiteCode === site.code ? "active" : ""
                              }`}
                              onClick={() => handleSiteSelect(site)}
                            >
                              <span className="site-name">{site.name}</span>
                              <span className="site-meta">
                                {site.code}
                                {selectedSiteCode === site.code ? (
                                  <span className="site-selected">
                                    Selected
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="site-picker-empty">No sites</p>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
              {siteListLoading && (
                <p className="site-picker-loading">Loading sites…</p>
              )}
              {!siteListLoading &&
                !regionGroups.some((group) => group.sites.length) &&
                !siteListError && (
                  <p className="site-picker-empty">No sites available.</p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
