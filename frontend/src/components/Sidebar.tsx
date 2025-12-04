import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getPublishedSitesByRegion,
  listPublishedSiteSummaries,
} from "../services/network";
import type { Site } from "../types/topology";
import LoginModal from "./auth/LoginModal"; // ⬅️ NEW

import "./Sidebar.css";

type RegionCfg = { code: string; label: string; img: string; slug: string };

const REGIONS: RegionCfg[] = [
  { code: "LUZON", label: "Luzon", img: "/letter-l.png", slug: "luzon" },
  { code: "VISAYAS", label: "Visayas", img: "/letter-v.png", slug: "visayas" },
  {
    code: "MINDANAO",
    label: "Mindanao",
    img: "/letter-m.png",
    slug: "mindanao",
  },
];

export function resolveInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("cnfm_theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function applyThemeVars(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const body = document.body;
  body.classList.remove("theme-light", "theme-dark");
  const nextClass = theme === "light" ? "theme-light" : "theme-dark";
  body.classList.add(nextClass);
  body.dataset.theme = theme;
  localStorage.setItem("cnfm_theme", theme);

  const root = document.documentElement;
  if (theme === "light") {
    root.style.setProperty("--sb-bg", "#ffffff");
    root.style.setProperty("--sb-fg", "#1e293b");
    root.style.setProperty("--sb-fg-dim", "#64748b");
    root.style.setProperty("--sb-border", "rgba(15,23,42,.08)");
    root.style.setProperty("--app-shell-bg", "#f8fafc");
    root.style.setProperty("--app-shell-text", "#0f172a");
    root.style.setProperty(
      "--footer-bg",
      "linear-gradient(to right, #f8f9fa, #e9ecef)"
    );
    root.style.setProperty("--footer-text", "#475569");
    root.style.setProperty("--footer-border", "rgba(148,163,184,.35)");
    root.style.setProperty("--viewer-muted", "#94a3b8");
    root.style.setProperty("--viewer-hero-muted", "#64748b");
    root.style.setProperty("--viewer-chip-bg", "rgba(148,163,184,.18)");
    root.style.setProperty("--viewer-chip-text", "#1d4ed8");
    root.style.setProperty("--viewer-select-bg", "#f1f5f9");
    root.style.setProperty("--viewer-select-text", "#0f172a");
    root.style.setProperty("--viewer-select-border", "rgba(148,163,184,.45)");
    root.style.setProperty(
      "--viewer-select-shadow",
      "0 4px 12px rgba(15,23,42,.08)"
    );
    root.style.setProperty("--viewer-canvas-bg", "#ffffff");
    root.style.setProperty("--viewer-canvas-border", "rgba(148,163,184,.35)");
    root.style.setProperty(
      "--viewer-canvas-shadow",
      "0 24px 48px rgba(15,23,42,.12)"
    );
    root.style.setProperty(
      "--viewer-empty-bg",
      "linear-gradient(180deg, rgba(241,245,249,.8), rgba(241,245,249,.6))"
    );
    root.style.setProperty("--viewer-empty-color", "#475569");
    root.style.setProperty(
      "--viewer-panel-shadow",
      "0 16px 28px rgba(15,23,42,.08)"
    );
    root.style.setProperty("--viewer-btn-ghost-text", "#0f172a");
    // Admin/Viewer extended tokens (light)
    root.style.setProperty("--editor-bg", "#f8fafc");
    root.style.setProperty("--editor-text", "#0f172a");
    root.style.setProperty("--editor-muted", "#475569");
    root.style.setProperty("--editor-subtext", "#334155");
    root.style.setProperty("--editor-panel", "#ffffff");
    root.style.setProperty("--editor-panel-strong", "#e2e8f0");
    root.style.setProperty("--editor-border", "rgba(148,163,184,.35)");
    root.style.setProperty("--editor-accent", "#2563eb");
    root.style.setProperty("--editor-accent-alt", "#1d4ed8");
    root.style.setProperty("--editor-status-color", "#94a3b8");
    root.style.setProperty("--editor-canvas-border", "rgba(59,130,246,.2)");
    root.style.setProperty(
      "--editor-canvas-shadow",
      "0 12px 28px rgba(15,23,42,.12)"
    );
    root.style.setProperty("--editor-btn-shadow", "0 8px 18px rgba(0,0,0,.08)");
    root.style.setProperty(
      "--editor-btn-shadow-hover",
      "0 12px 28px rgba(0,0,0,.12)"
    );
    root.style.setProperty(
      "--editor-btn-shadow-active",
      "0 6px 16px rgba(0,0,0,.1)"
    );
    root.style.setProperty("--editor-form-bg", "#ffffff");
    root.style.setProperty("--editor-form-border", "rgba(148,163,184,.35)");
    root.style.setProperty("--editor-form-text", "#0f172a");
    root.style.setProperty("--editor-detail-muted", "#475569");
    root.style.setProperty("--editor-detail-empty", "#475569");
    root.style.setProperty(
      "--editor-empty-bg",
      "linear-gradient(180deg, rgba(241,245,249,.8), rgba(241,245,249,.6))"
    );
    root.style.setProperty("--editor-empty-text", "#475569");
    root.style.setProperty("--editor-empty-border", "rgba(148,163,184,.35)");
    root.style.setProperty("--editor-empty-panel", "#ffffff");
    root.style.setProperty(
      "--editor-empty-shadow",
      "0 20px 40px rgba(15,23,42,.12)"
    );
    root.style.setProperty("--viewer-card-bg", "#ffffff");
    root.style.setProperty("--viewer-card-border", "rgba(226,232,240,.9)");
    root.style.setProperty("--viewer-card-title", "#b91c1c");
    root.style.setProperty("--viewer-card-text", "#1f2937");
    root.style.setProperty("--viewer-card-sub", "#475569");
    root.style.setProperty("--viewer-card-alt", "#047857");
    root.style.setProperty("--viewer-card-alt-text", "#14532d");
    root.style.setProperty("--viewer-tooltip-bg", "#ffffff");
    root.style.setProperty("--viewer-tooltip-border", "rgba(203,213,225,.8)");
    root.style.setProperty("--viewer-tooltip-text", "#1f2937");
    root.style.setProperty("--viewer-tooltip-label", "#475569");
    root.style.setProperty("--viewer-tooltip-status-good", "#15803d");
    root.style.setProperty("--viewer-tooltip-status-bad", "#b91c1c");
    root.style.setProperty("--viewer-hover-border-on", "#0f766e");
    root.style.setProperty("--viewer-hover-border-off", "#b91c1c");
    root.style.setProperty("--viewer-hover-good-bg", "rgba(16,185,129,.12)");
    root.style.setProperty("--viewer-hover-bad-bg", "rgba(220,38,38,.12)");
    root.style.setProperty("--viewer-edge-normal", "#2563eb");
    root.style.setProperty("--viewer-edge-normal-soft", "#60a5fa");
    root.style.setProperty("--viewer-edge-alt", "#10b981");
    root.style.setProperty("--viewer-edge-alt-soft", "#34d399");
    root.style.setProperty("--viewer-edge-offline", "#dc2626");
    root.style.setProperty("--viewer-edge-offline-soft", "#f87171");
    root.style.setProperty("--viewer-edge-structural", "rgba(148,163,184,.45)");
    root.style.setProperty("--viewer-edge-glow", "rgba(37,99,235,.25)");
    root.style.setProperty("--viewer-edge-glow-alt", "rgba(16,185,129,.28)");
    root.style.setProperty("--viewer-edge-glow-offline", "rgba(220,38,38,.28)");
    root.style.setProperty("--viewer-edge-label-bg", "#fde68a");
    root.style.setProperty("--viewer-edge-label-border", "#f59e0b");
    root.style.setProperty("--viewer-edge-label-text", "#1f2937");
    root.style.setProperty("--viewer-edge-label-alt-bg", "#bbf7d0");
    root.style.setProperty("--viewer-edge-label-alt-border", "#0f766e");
    root.style.setProperty("--viewer-edge-label-alt-text", "#14532d");
    root.style.setProperty("--viewer-edge-label-offline-bg", "#fecdd3");
    root.style.setProperty("--viewer-edge-label-offline-border", "#fb7185");
    root.style.setProperty("--viewer-edge-label-offline-text", "#7f1d1d");
    root.style.setProperty(
      "--viewer-edge-label-structural-bg",
      "rgba(148,163,184,.18)"
    );
    root.style.setProperty(
      "--viewer-edge-label-structural-border",
      "rgba(148,163,184,.45)"
    );
    root.style.setProperty("--viewer-edge-label-structural-text", "#475569");
    root.style.setProperty("--asb-bg", "#ffffff");
    root.style.setProperty("--asb-fg", "#1e293b");
    root.style.setProperty("--asb-fg-dim", "#64748b");
    root.style.setProperty("--asb-accent", "#2563eb");
    root.style.setProperty("--asb-active", "#1d4ed8");
    root.style.setProperty("--asb-hover-bg", "rgba(148,163,184,.12)");
    root.style.setProperty("--asb-hover-border", "rgba(148,163,184,.22)");
    root.style.setProperty("--asb-active-bg", "rgba(37,99,235,.12)");
    root.style.setProperty("--asb-active-border", "rgba(37,99,235,.36)");
    root.style.setProperty("--asb-card-bg", "rgba(148,163,184,.12)");
    root.style.setProperty("--asb-card-border", "rgba(148,163,184,.25)");
    root.style.setProperty("--admin-shell-bg", "#f8fafc");
    root.style.setProperty("--admin-shell-text", "#0f172a");
    root.style.setProperty("--admin-shell-border", "rgba(148,163,184,.35)");
  } else {
    root.style.setProperty("--sb-bg", "rgba(7,12,22,.95)");
    root.style.setProperty("--sb-fg", "#e2e8f0");
    root.style.setProperty("--sb-fg-dim", "rgba(148,163,184,.8)");
    root.style.setProperty("--sb-border", "rgba(148,163,184,.15)");
    root.style.setProperty("--app-shell-bg", "rgba(7,12,22,.92)");
    root.style.setProperty("--app-shell-text", "#e2e8f0");
    root.style.setProperty(
      "--footer-bg",
      "linear-gradient(135deg, rgba(15,23,42,.9), rgba(15,23,42,.7))"
    );
    root.style.setProperty("--footer-text", "rgba(148,163,184,.85)");
    root.style.setProperty("--footer-border", "rgba(15,23,42,.6)");
    root.style.setProperty("--viewer-muted", "rgba(148,163,184,.75)");
    root.style.setProperty("--viewer-hero-muted", "rgba(191,219,254,.82)");
    root.style.setProperty("--viewer-chip-bg", "rgba(59,130,246,.18)");
    root.style.setProperty("--viewer-chip-text", "#38bdf8");
    root.style.setProperty("--viewer-select-bg", "rgba(15,23,42,.65)");
    root.style.setProperty("--viewer-select-text", "#e2e8f0");
    root.style.setProperty("--viewer-select-border", "rgba(96,165,250,.35)");
    root.style.setProperty(
      "--viewer-select-shadow",
      "0 10px 24px rgba(7,12,22,.45)"
    );
    root.style.setProperty("--viewer-canvas-bg", "rgba(7,12,22,.92)");
    root.style.setProperty("--viewer-canvas-border", "rgba(59,130,246,.25)");
    root.style.setProperty(
      "--viewer-canvas-shadow",
      "0 30px 60px rgba(7,11,19,.6)"
    );
    root.style.setProperty(
      "--viewer-empty-bg",
      "linear-gradient(180deg, rgba(7,12,22,.78), rgba(7,12,22,.64))"
    );
    root.style.setProperty("--viewer-empty-color", "rgba(191,219,254,.75)");
    root.style.setProperty(
      "--viewer-panel-shadow",
      "inset 0 0 0 1px rgba(59,130,246,.08), 0 10px 24px rgba(7,12,22,.4)"
    );
    root.style.setProperty("--viewer-btn-ghost-text", "rgba(191,219,254,.85)");
    // Admin/Viewer extended tokens (dark)
    root.style.setProperty("--editor-bg", "#0b1220");
    root.style.setProperty("--editor-text", "#e2e8f0");
    root.style.setProperty("--editor-muted", "rgba(148,163,184,.7)");
    root.style.setProperty("--editor-subtext", "rgba(191,219,254,.82)");
    root.style.setProperty("--editor-panel", "rgba(15,23,42,.72)");
    root.style.setProperty("--editor-panel-strong", "rgba(8,13,23,.82)");
    root.style.setProperty("--editor-border", "rgba(148,163,184,.25)");
    root.style.setProperty("--editor-accent", "#2563eb");
    root.style.setProperty("--editor-accent-alt", "#1d4ed8");
    root.style.setProperty("--editor-status-color", "rgba(148,163,184,.6)");
    root.style.setProperty("--editor-canvas-border", "rgba(59,130,246,.25)");
    root.style.setProperty(
      "--editor-canvas-shadow",
      "0 30px 60px rgba(7,11,19,.6)"
    );
    root.style.setProperty(
      "--editor-btn-shadow",
      "0 8px 18px rgba(37,99,235,.15)"
    );
    root.style.setProperty(
      "--editor-btn-shadow-hover",
      "0 12px 28px rgba(37,99,235,.2)"
    );
    root.style.setProperty(
      "--editor-btn-shadow-active",
      "0 6px 16px rgba(37,99,235,.18)"
    );
    root.style.setProperty("--editor-form-bg", "rgba(7,12,22,.85)");
    root.style.setProperty("--editor-form-border", "rgba(148,163,184,.3)");
    root.style.setProperty("--editor-form-text", "#e2e8f0");
    root.style.setProperty("--editor-detail-muted", "rgba(148,163,184,.8)");
    root.style.setProperty("--editor-detail-empty", "rgba(148,163,184,.75)");
    root.style.setProperty(
      "--editor-empty-bg",
      "linear-gradient(180deg, rgba(7,12,22,.78), rgba(7,12,22,.64))"
    );
    root.style.setProperty("--editor-empty-text", "rgba(191,219,254,.75)");
    root.style.setProperty("--editor-empty-border", "rgba(59,130,246,.28)");
    root.style.setProperty("--editor-empty-panel", "rgba(8,13,23,.82)");
    root.style.setProperty(
      "--editor-empty-shadow",
      "0 20px 40px rgba(7,11,19,.45)"
    );
    root.style.setProperty("--viewer-card-bg", "rgba(10,16,27,.8)");
    root.style.setProperty("--viewer-card-border", "rgba(79,70,229,.25)");
    root.style.setProperty("--viewer-card-title", "#fca5a5");
    root.style.setProperty("--viewer-card-text", "rgba(191,219,254,.9)");
    root.style.setProperty("--viewer-card-sub", "rgba(226,232,240,.8)");
    root.style.setProperty("--viewer-card-alt", "#34d399");
    root.style.setProperty("--viewer-card-alt-text", "rgba(226,232,240,.82)");
    root.style.setProperty("--viewer-tooltip-bg", "rgba(15,23,42,.95)");
    root.style.setProperty("--viewer-tooltip-border", "rgba(148,163,184,.35)");
    root.style.setProperty("--viewer-tooltip-text", "rgba(226,232,240,.85)");
    root.style.setProperty("--viewer-tooltip-label", "rgba(148,163,184,.75)");
    root.style.setProperty("--viewer-tooltip-status-good", "#4ade80");
    root.style.setProperty("--viewer-tooltip-status-bad", "#fca5a5");
    root.style.setProperty("--viewer-hover-border-on", "#22c55e");
    root.style.setProperty("--viewer-hover-border-off", "#f87171");
    root.style.setProperty("--viewer-hover-good-bg", "rgba(34,197,94,.14)");
    root.style.setProperty("--viewer-hover-bad-bg", "rgba(248,113,113,.2)");
    root.style.setProperty("--viewer-edge-normal", "#60a5fa");
    root.style.setProperty("--viewer-edge-normal-soft", "#2563eb");
    root.style.setProperty("--viewer-edge-alt", "#34d399");
    root.style.setProperty("--viewer-edge-alt-soft", "#4ade80");
    root.style.setProperty("--viewer-edge-offline", "#f87171");
    root.style.setProperty("--viewer-edge-offline-soft", "#fca5a5");
    root.style.setProperty("--viewer-edge-structural", "rgba(148,163,184,.45)");
    root.style.setProperty("--viewer-edge-glow", "rgba(96,165,250,.35)");
    root.style.setProperty("--viewer-edge-glow-alt", "rgba(52,211,153,.35)");
    root.style.setProperty(
      "--viewer-edge-glow-offline",
      "rgba(248,113,113,.45)"
    );
    root.style.setProperty("--viewer-edge-label-bg", "#facc15");
    root.style.setProperty("--viewer-edge-label-border", "#b45309");
    root.style.setProperty("--viewer-edge-label-text", "#1f2937");
    root.style.setProperty("--viewer-edge-label-alt-bg", "#34d399");
    root.style.setProperty("--viewer-edge-label-alt-border", "#166534");
    root.style.setProperty("--viewer-edge-label-alt-text", "#022c22");
    root.style.setProperty("--viewer-edge-label-offline-bg", "#f87171");
    root.style.setProperty("--viewer-edge-label-offline-border", "#991b1b");
    root.style.setProperty("--viewer-edge-label-offline-text", "#fff5f5");
    root.style.setProperty(
      "--viewer-edge-label-structural-bg",
      "rgba(148,163,184,.15)"
    );
    root.style.setProperty(
      "--viewer-edge-label-structural-border",
      "rgba(148,163,184,.4)"
    );
    root.style.setProperty("--viewer-edge-label-structural-text", "#e2e8f0");
    root.style.setProperty("--asb-bg", "#0b1220");
    root.style.setProperty("--asb-fg", "#cbd5e1");
    root.style.setProperty("--asb-fg-dim", "#94a3b8");
    root.style.setProperty("--asb-accent", "#60a5fa");
    root.style.setProperty("--asb-active", "#1d4ed8");
    root.style.setProperty("--asb-hover-bg", "rgba(255,255,255,.06)");
    root.style.setProperty("--asb-hover-border", "rgba(255,255,255,.08)");
    root.style.setProperty("--asb-active-bg", "rgba(96,165,250,.12)");
    root.style.setProperty("--asb-active-border", "rgba(96,165,250,.35)");
    root.style.setProperty("--asb-card-bg", "rgba(255,255,255,.05)");
    root.style.setProperty("--asb-card-border", "rgba(255,255,255,.06)");
    root.style.setProperty(
      "--admin-shell-bg",
      "radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 60%), #071426"
    );
    root.style.setProperty("--admin-shell-text", "#e2e8f0");
    root.style.setProperty("--admin-shell-border", "rgba(37,99,235,.35)");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cnfm-theme-change", { detail: theme })
    );
  }
}

const INITIAL_THEME = resolveInitialTheme();
if (typeof document !== "undefined") {
  applyThemeVars(INITIAL_THEME);
}

export default function Sidebar() {
  const WIDTH_PINNED = "210px";
  const WIDTH_COLLAPSED = "72px";

  const [clickOpen, setClickOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openRegion, setOpenRegion] = useState<string>();
  const [hovering, setHovering] = useState(false);
  const [sitesByRegion, setSitesByRegion] = useState<Record<string, Site[]>>(
    {}
  );
  const [loadingRegion, setLoadingRegion] = useState<string>();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<"light" | "dark">(INITIAL_THEME);

  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Shift layout with sidebar width (only on pin/unpin)
  useEffect(() => {
    const width = clickOpen || expanded ? WIDTH_PINNED : WIDTH_COLLAPSED;
    document.documentElement.style.setProperty("--sb-current", width);
  }, [clickOpen, expanded]);

  useEffect(() => {
    (async () => {
      try {
        const summaries = await listPublishedSiteSummaries();
        const counts: Record<string, number> = {
          LUZON: 0,
          VISAYAS: 0,
          MINDANAO: 0,
        };
        summaries.forEach((item) => {
          counts[item.regionCode] = (counts[item.regionCode] || 0) + 1;
        });
        setSiteCounts(counts);
      } catch (err) {
        console.error("published site summary error:", err);
        setSiteCounts({ LUZON: 0, VISAYAS: 0, MINDANAO: 0 });
      }
    })();
  }, []);

  useLayoutEffect(() => {
    applyThemeVars(theme);
  }, [theme]);

  useEffect(() => {
    const handleExternalLogin = () => setShowLogin(true);
    window.addEventListener("cnfm-open-login" as any, handleExternalLogin);
    return () => {
      window.removeEventListener("cnfm-open-login" as any, handleExternalLogin);
    };
  }, []);

  // Hover expand/contract
  const handleMouseEnter = () => {
    setHovering(true);
    if (!clickOpen) setExpanded(true);
  };
  const handleMouseLeave = () => {
    setHovering(false);
    if (!clickOpen) setExpanded(false);
  };

  // Collapse on route change if not pinned
  useEffect(() => {
    if (!clickOpen && !hovering) setExpanded(false);
  }, [location, clickOpen, hovering]);

  // Close when clicking outside (if pinned)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!clickOpen) return;
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setClickOpen(false);
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [clickOpen]);

  const toggleByClick = () => {
    const next = !clickOpen;
    setClickOpen(next);
    setExpanded(next);
  };

  const fetchRegionSites = useCallback(
    async (rc: RegionCfg) => {
      if (sitesByRegion[rc.code]) return sitesByRegion[rc.code];
      try {
        setLoadingRegion(rc.code);
        const sites = await getPublishedSitesByRegion(rc.code);
        setSitesByRegion((prev) => ({ ...prev, [rc.code]: sites }));
        setSiteCounts((prev) => ({
          ...prev,
          [rc.code]: sites.length,
        }));
        return sites;
      } catch (err) {
        console.error("region sites error:", err);
        return [] as Site[];
      } finally {
        setLoadingRegion(undefined);
      }
    },
    [sitesByRegion]
  );

  const toggleRegion = async (rc: RegionCfg) => {
    const willOpen = openRegion !== rc.code;
    if (willOpen) {
      setOpenRegion(rc.code);
      await fetchRegionSites(rc);
    } else {
      setOpenRegion(undefined);
    }
  };

  useEffect(() => {
    const match = location.pathname.match(/^\/topology\/(\w+)/i);
    if (!match) return;
    const routeCode = match[1].toUpperCase();

    const ensureRegionOpen = async () => {
      const cachedRegion = REGIONS.find((rc) =>
        sitesByRegion[rc.code]?.some(
          (site) => site.code.toUpperCase() === routeCode
        )
      );
      if (cachedRegion) {
        setOpenRegion(cachedRegion.code);
        if (clickOpen) {
          setExpanded(true);
        }
        return;
      }
      for (const rc of REGIONS) {
        const sites = await fetchRegionSites(rc);
        if (sites.some((site) => site.code.toUpperCase() === routeCode)) {
          setOpenRegion(rc.code);
          if (clickOpen) {
            setExpanded(true);
          }
          break;
        }
      }
    };

    ensureRegionOpen();
  }, [location.pathname, fetchRegionSites, sitesByRegion, clickOpen]);

  const handleSiteNavigate = () => {};

  return (
    <>
      <aside
        ref={wrapRef}
        className={`sb-root ${expanded ? "expanded" : "collapsed"} ${
          clickOpen ? "pinned" : ""
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Primary"
        aria-expanded={clickOpen || expanded}
      >
        <div className="sb-inner">
          {/* Logo (click to pin/unpin) */}
          <button
            className="sb-logo-btn"
            onClick={toggleByClick}
            aria-pressed={clickOpen}
            aria-label={clickOpen ? "Unpin sidebar" : "Pin sidebar"}
            title={clickOpen ? "Unpin sidebar" : "Pin sidebar"}
          >
            <img
              src="/CNFM%20Logo.png"
              alt="CNFM"
              className="sb-logo"
              width={48}
              height={48}
            />
          </button>

          {/* Navigation */}
          <nav className="sb-nav">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                ["sb-link", "sb-top-link", isActive ? "active" : ""]
                  .filter(Boolean)
                  .join(" ")
              }
              title="Home"
            >
              <span className="sb-ico" aria-hidden>
                <svg
                  className="ico-home"
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                >
                  <path
                    d="M4 11.5 12 4l8 7.5v7a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-7Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="sb-label">Home</span>
            </NavLink>

            {/* Regions (click to expand sites) */}
            {REGIONS.map((rc) => {
              const sites = sitesByRegion[rc.code];
              const isOpen = openRegion === rc.code;
              const total = siteCounts[rc.code];
              const countLabel = (() => {
                if (loadingRegion === rc.code) return "Loading…";
                if (typeof total === "number") {
                  return total === 0
                    ? "No sites"
                    : `${total} site${total === 1 ? "" : "s"}`;
                }
                return "Loading…";
              })();

              return (
                <div key={rc.code} className="sb-region-group">
                  <button
                    type="button"
                    className={`sb-link sb-region-btn ${isOpen ? "open" : ""}`}
                    onClick={() => toggleRegion(rc)}
                    aria-expanded={isOpen}
                    title={rc.label}
                  >
                    <span className="sb-region-icon" aria-hidden>
                      <img src={rc.img} alt="" className="sb-region-img" />
                    </span>
                    <span className="sb-region-labels">
                      <span className="sb-label">{rc.label}</span>
                      <span className="sb-region-meta">{countLabel}</span>
                    </span>
                    <span className="sb-caret" aria-hidden>
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <ul
                      className="sb-subnav"
                      role="list"
                      aria-label={`${rc.label} sites`}
                    >
                      {loadingRegion === rc.code ? (
                        <li className="sb-subnav-loading">
                          <span className="sb-spinner" aria-hidden />
                          <span>Loading sites…</span>
                        </li>
                      ) : sites && sites.length > 0 ? (
                        sites.map((site) => (
                          <li key={site.id}>
                            <NavLink
                              to={`/topology/${site.code.toLowerCase()}`}
                              className={({ isActive }) =>
                                ["sb-site-link", isActive ? "active" : ""]
                                  .filter(Boolean)
                                  .join(" ")
                              }
                              onClick={handleSiteNavigate}
                            >
                              <span className="sb-dot" aria-hidden />
                              <span className="sb-site-name">{site.name}</span>
                            </NavLink>
                          </li>
                        ))
                      ) : (
                        <li className="sb-subnav-empty">No sites found</li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="sb-spacer" />

          {/* Footer (Login button) */}
          <div className="sb-footer">
            <button
              type="button"
              className="sb-link d-flex align-items-center gap-2 sb-theme-btn"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              aria-label="Toggle theme"
            >
              <span className="sb-ico" aria-hidden>
                {theme === "light" ? (
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path
                      d="M21 12.79A9 9 0 0 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path
                      d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 5.64a1 1 0 0 1 1.42 0L6.34 6.3A1 1 0 0 1 4.9 7.74L4.22 7.05a1 1 0 0 1 0-1.41Zm13.44 13.44a1 1 0 0 1 1.41 0l.69.69a1 1 0 0 1-1.41 1.41l-.69-.69a1 1 0 0 1 0-1.41ZM3 11h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Zm17 0h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2Zm-1.22-5.36a1 1 0 0 1 0 1.41l-.69.69A1 1 0 0 1 17.64 6.3l.69-.69a1 1 0 0 1 1.41 0ZM6.34 18.36a1 1 0 0 1 0 1.41l-.69.69a1 1 0 0 1-1.42-1.41l.69-.69a1 1 0 0 1 1.42 0Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </span>
              <span className="sb-label">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>
            <button
              type="button"
              className="sb-link d-flex align-items-center gap-2 sb-login-btn"
              onClick={() => setShowLogin(true)}
              aria-haspopup="dialog"
              aria-controls="login-modal"
            >
              <span className="sb-ico" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="sb-label">Login</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          // LoginModal already persists auth via saveAuth
          setShowLogin(false);
          navigate("/admin"); // ⬅️ land on the admin app (AdminSidebar)
        }}
      />
    </>
  );
}
