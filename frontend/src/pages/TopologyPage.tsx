import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { getSiteTopology } from "../services/network";
import type { Connection, SiteTopology } from "../types/topology";
import { extractServiceNames } from "../types/topology";
import {
  hasSharedLoadTechnology,
  normalizeLoadLabel,
} from "../utils/loadMatching";
import "./Visayas/topology.css";

type AltInfo = { isAlternative: boolean; matchingLoad: string[] };
type AltMap = Record<string, AltInfo>;
type HoverState = { key: string; x: number; y: number } | null;

export default function TopologyPage({
  siteCode,
  titleOverride,
}: {
  siteCode: string;
  titleOverride?: string;
}) {
  const [data, setData] = useState<SiteTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState<Set<string>>(new Set());
  const [alt, setAlt] = useState<Record<string, AltMap>>({});
  const [hover, setHover] = useState<HoverState>(null);
  const [siteBtnHover, setSiteBtnHover] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // ===== Fetch topology from API (DB-backed)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const topo = await getSiteTopology(siteCode);
        if (!cancelled) {
          setData(topo);
          setOffline(new Set());
          setAlt({});
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteCode]);

  // ===== Recompute alternates whenever offline/data change
  useEffect(() => {
    if (!data) return;
    const out: Record<string, AltMap> = {};
    for (const key of offline) {
      out[key] = findAlternatives(key, data.connections, offline);
    }
    setAlt(out);
  }, [offline, data]);

  const allOffline = useMemo(
    () => !!data && offline.size === data.connections.length,
    [offline, data]
  );

  if (loading) return <div className="p-4">Loading…</div>;
  if (!data) return <div className="p-4">No data available.</div>;

  // ===== Controls
  const resetAll = () => {
    setOffline(new Set());
    setAlt({});
  };
  const setAllOffline = () => {
    setOffline(new Set(data.connections.map((c) => c.key)));
  };
  const toggleAll = () => {
    allOffline ? resetAll() : setAllOffline();
  };
  const toggleConnection = (key: string) => {
    const next = new Set(offline);
    next.has(key) ? next.delete(key) : next.add(key);
    setOffline(next);
  };

  const classFor = (key: string) => {
    if (offline.has(key)) return "connection connection-offline";
    const isAlt = Object.values(alt).some((m) => !!m[key]?.isAlternative);
    return isAlt
      ? "connection connection-alternative"
      : "connection connection-normal";
  };

  // ===== Tooltip helpers
  const posFromEvent = (e: React.MouseEvent) => {
    const wrap = canvasRef.current;
    if (!wrap) return { x: 0, y: 0 };
    const rect = wrap.getBoundingClientRect();
    return { x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 };
  };
  const showHover = (key: string, e: React.MouseEvent) => {
    const { x, y } = posFromEvent(e);
    setHover({ key, x, y });
  };
  const moveHover = (e: React.MouseEvent) => {
    if (!hover) return;
    const { x, y } = posFromEvent(e);
    setHover((h) => (h ? { ...h, x, y } : null));
  };
  const hideHover = () => setHover(null);

  const getHoverData = (key: string) => {
    const c = data!.connections.find((x) => x.key === key);
    if (!c) return null;
    const isOffline = offline.has(key);
    const alternativeFor: Array<{
      offKey: string;
      name: string;
      matching: string[];
    }> = [];
    if (!isOffline) {
      for (const offKey of Object.keys(alt)) {
        const map = alt[offKey];
        if (map && map[key]?.isAlternative) {
          const offConn = data!.connections.find((x) => x.key === offKey);
          alternativeFor.push({
            offKey,
            name: offConn?.displayName || offKey,
            matching: map[key].matchingLoad,
          });
        }
      }
    }
    return {
      displayName: c.displayName,
      route: `${c.from} → ${c.to}`,
      load: c.load,
      isOffline,
      alternativeFor,
    };
  };

  const siteTitle = titleOverride || data.site.name || siteCode;
  const serviceNames = extractServiceNames(data.services);

  return (
    <div className="nw-container">
      <header className="nw-header">
        <h1>
          Network Route Analysis Wargame –{" "}
          <span className="site-title-anim">{siteTitle}</span>
        </h1>
        <p>
          Click on connections to toggle offline status. Alternate routes with
          matching equipment will turn green.
        </p>
      </header>

      <div className="nw-toolbar">
        <div className="legend-inline">
          <span className="dot normal" /> Normal
          <span className="dot alt" /> Alternate
          <span className="dot off" /> Offline
        </div>
        <button
          className="btn reset-cta"
          onMouseDown={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.setProperty("--rx", `${e.nativeEvent.offsetX}px`);
            el.style.setProperty("--ry", `${e.nativeEvent.offsetY}px`);
          }}
          onClick={resetAll}
        >
          <span className="reset-icon" />
          <span className="reset-label">Reset All to Online</span>
        </button>
      </div>

      <div className="canvas-wrap" ref={canvasRef}>
        <svg viewBox="0 0 1280 720" className="nw-svg wide">
          {/* Static infra from DB */}
          {data.staticPaths.map((d, i) => (
            <path key={i} d={d} className="connection-static" />
          ))}

          {/* Dynamic links from DB */}
          {data.connections.map((conn) =>
            conn.segments.map((seg, idx) => (
              <path
                key={`${conn.key}-${idx}`}
                d={seg.path}
                className={`${classFor(conn.key)} ${
                  hover?.key === conn.key ? "connection-hover" : ""
                }`}
                onClick={() => toggleConnection(conn.key)}
                onMouseEnter={(e) => showHover(conn.key, e)}
                onMouseMove={moveHover}
                onMouseLeave={hideHover}
                style={{ strokeWidth: hover?.key === conn.key ? 8 : 6 }}
              />
            ))
          )}

          {/* Yellow pills - prefer DB label rect; fallback to midpoint */}
          {data.connections.map((conn) => {
            const pill =
              conn.label ??
              rectFromMidpoint(conn, {
                width: 200,
                height: 24,
                padX: 100,
                padY: 12,
              });
            return (
              <g
                key={`${conn.key}-label`}
                className="link-label"
                onClick={() => toggleConnection(conn.key)}
                onMouseEnter={(e) => showHover(conn.key, e)}
                onMouseMove={moveHover}
                onMouseLeave={hideHover}
                style={{ cursor: "pointer", pointerEvents: "visiblePainted" }}
              >
                <rect
                  x={pill.x}
                  y={pill.y}
                  width={pill.width}
                  height={pill.height}
                  rx={5}
                  ry={5}
                  className="site-rect-label"
                />
                <text
                  x={pill.x + pill.width / 2}
                  y={pill.y + pill.height / 2}
                  className="bold-connection-label"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {conn.displayName}
                </text>
              </g>
            );
          })}

          {/* Main (selected) site box (from DB) */}
          <g
            onMouseEnter={() => setSiteBtnHover(true)}
            onMouseLeave={() => setSiteBtnHover(false)}
            onClick={toggleAll}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={(data.site.x ?? 100).toString()}
              y={(data.site.y ?? 250).toString()}
              width={(data.site.width ?? 150).toString()}
              height={(data.site.height ?? 60).toString()}
              rx="5"
              className={`site-rect ${
                siteBtnHover
                  ? allOffline
                    ? "site-hover-green"
                    : "site-hover-red"
                  : allOffline
                  ? "site-off"
                  : "site-on"
              }`}
            />
            <text
              x={(data.site.x ?? 100) + (data.site.width ?? 150) / 2}
              y={(data.site.y ?? 250) + (data.site.height ?? 60) / 2 + 5}
              className="site-text"
              textAnchor="middle"
            >
              {data.site.name || siteCode}
            </text>
          </g>

          {/* Blue place nodes from DB (TUBOD/PAGADIAN/CDO/DAUIN…) */}
          {(data.placeNodes || []).map((n) => (
            <g key={n.code}>
              <rect
                x={n.x}
                y={n.y}
                width={n.width ?? 150}
                height={n.height ?? 60}
                rx="5"
                className="site-rect"
              />
              <text
                x={n.x + (n.width ?? 150) / 2}
                y={n.y + (n.height ?? 60) / 2 + 5}
                className="site-text"
                textAnchor="middle"
              >
                {n.name ?? n.code}
              </text>
            </g>
          ))}

          {/* Static “context” boxes — intentionally embedded (not DB) */}
          {/* IPCORE Network */}
          <rect
            x="20"
            y="350"
            width="140"
            height="60"
            rx="5"
            className="site-rect"
          />
          <text x="90" y="385" className="site-text">
            IPCORE Network
          </text>
          {/* CORE NEs */}
          <rect
            x="20"
            y="450"
            width="140"
            height="60"
            rx="5"
            className="site-rect"
          />
          <text x="90" y="485" className="site-text">
            CORE NEs
          </text>
          {/* The Rest of South Luzon, Visayas, and Mindanao Network */}
          <rect
            x="1000"
            y="230"
            width="200"
            height="100"
            rx="5"
            className="site-rect"
          />
          <text x="1100" y="270" className="site-text">
            The Rest of South Luzon,
          </text>
          <text x="1100" y="285" className="site-text">
            Visayas, and
          </text>
          <text x="1100" y="300" className="site-text">
            Mindanao Network
          </text>
        </svg>

        {/* Hover tooltip */}
        {hover && (
          <HoverCard
            x={hover.x}
            y={hover.y}
            data={getHoverData(hover.key)}
            containerRef={canvasRef}
          />
        )}

        {/* Services Drawer (top-right) */}
        <div className={`sidepanel ${showServices ? "open" : "closed"}`}>
          <button
            className="sp-toggle"
            onClick={() => setShowServices((v) => !v)}
          >
            <span className="sp-title">{siteTitle.toUpperCase()} SERVICES</span>
            <span className="sp-burger">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div className="sp-body">
            <ul>
              {serviceNames.length
                ? serviceNames.map((s, i) => <li key={i}>{s}</li>)
                : [
                    "2G, 4G, LTE, 5G",
                    "Data, SMS, Voice",
                    "VoLTE / VoWiFi / Mobile Broadband",
                  ].map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Analysis panel */}
      <section className="nw-analysis wide-area">
        <h3>Route Analysis</h3>
        {offline.size === 0 ? (
          <p>No connections offline. All routes are operational.</p>
        ) : (
          Array.from(offline).map((offKey) => {
            const conn = data.connections.find((c) => c.key === offKey);
            const alts = alt[offKey];
            return (
              <div key={offKey} className="offline-card">
                <div className="title">
                  {conn?.displayName || offKey} - OFFLINE
                </div>
                <div className="sub">Load: {conn?.load.join(", ")}</div>
                <div className="route-line">
                  Route: {conn?.from} → {conn?.to}
                </div>
                {alts && Object.keys(alts).length > 0 && (
                  <>
                    <div className="alt-title">Alternate Route:</div>
                    {Object.entries(alts).map(([k, info]) => (
                      <div key={k} className="alt-item">
                        • {titleFor(k, data.connections)} - Matching:{" "}
                        {info.matchingLoad.join(", ")}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

/* ===== Helpers for label placement ===== */
function rectFromMidpoint(
  conn: Connection,
  opts: { width: number; height: number; padX: number; padY: number }
): { x: number; y: number; width: number; height: number } {
  const mid = midpointOfFirstSegment(conn);
  return {
    x: mid.x - opts.padX,
    y: mid.y - opts.padY,
    width: opts.width,
    height: opts.height,
  };
}

/** Try to find the midpoint of the first simple "M x y L x y" segment. */
function midpointOfFirstSegment(conn: Connection): { x: number; y: number } {
  for (const seg of conn.segments) {
    const d = seg.path.trim();
    const m = d.match(/M\s*([0-9.]+)\s*([0-9.]+)\s*L\s*([0-9.]+)\s*([0-9.]+)/i);
    if (m) {
      const x1 = parseFloat(m[1]);
      const y1 = parseFloat(m[2]);
      const x2 = parseFloat(m[3]);
      const y2 = parseFloat(m[4]);
      return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    }
  }
  return { x: 380, y: 285 };
}

/* ---------- Hover Card ---------- */
function HoverCard({
  x,
  y,
  data,
  containerRef,
}: {
  x: number;
  y: number;
  data: {
    displayName: string;
    route: string;
    load: string[];
    isOffline: boolean;
    alternativeFor: Array<{ offKey: string; name: string; matching: string[] }>;
  } | null;
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
    const { width: wrapW, height: wrapH } = wrap.getBoundingClientRect();
    const left = Math.min(Math.max(8, x), Math.max(8, wrapW - cardW - 8));
    const top = Math.min(Math.max(8, y), Math.max(8, wrapH - cardH - 8));
    setPos({ left, top });
  }, [x, y, data, containerRef]);
  if (!data) return null;
  const { displayName, route, load, isOffline, alternativeFor } = data;
  return (
    <div
      ref={ref}
      className={`nw-hovercard ${isOffline ? "off" : "on"}`}
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="hc-title">{displayName}</div>
      <div className="hc-row">Route: {route}</div>
      <div className="hc-row">
        <span className="hc-label">Load:</span>
      </div>
      <ul className="hc-list">
        {load.map((l) => (
          <li key={l}>• {l}</li>
        ))}
      </ul>
      {!isOffline &&
        alternativeFor.map((alt, i) => (
          <div key={i}>
            <div className="hc-row alt-for">Alternative for: {alt.name}</div>
            <div className="hc-row match">
              Matching Load: {alt.matching.join(", ")}
            </div>
          </div>
        ))}
      <div className={`hc-status ${isOffline ? "bad" : "good"}`}>
        {isOffline ? "OFFLINE" : "ONLINE"}
      </div>
    </div>
  );
}

/* ---------- Alternate-route logic ---------- */
function findAlternatives(
  offlineKey: string,
  conns: Connection[],
  offlineSet: Set<string>
): Record<string, AltInfo> {
  const off = conns.find((c) => c.key === offlineKey);
  if (!off) return {};
  const out: Record<string, AltInfo> = {};
  for (const c of conns) {
    if (c.key === offlineKey || offlineSet.has(c.key)) continue;

    const canAlt =
      c.from === off.from ||
      c.to === off.to ||
      c.from === off.to ||
      c.to === off.from;
    if (!canAlt) continue;

    const matching: string[] = [];
    const seenMatches = new Set<string>();
    for (const a of off.load) {
      const normA = normalizeLoadLabel(a);
      if (!normA) continue;
      for (const b of c.load) {
        const normB = normalizeLoadLabel(b);
        if (!normB) continue;
        if (
          normA === normB ||
          hasSharedLoadTechnology(normA, normB)
        ) {
          if (!seenMatches.has(normB)) {
            seenMatches.add(normB);
            matching.push(b);
          }
        }
      }
    }
    if (matching.length)
      out[c.key] = { isAlternative: true, matchingLoad: matching };
  }
  return out;
}

function titleFor(key: string, conns: Connection[]) {
  const c = conns.find((x) => x.key === key);
  if (!c) return key;
  return `${c.displayName} (${c.from} → ${c.to})`;
}
