import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./AdminSidebar.css";
import type { UserRole } from "../../services/auth";

type AdminUser = {
  firstname?: string;
  lastname?: string;
  username?: string;
  role?: UserRole;
};

type Props = {
  user?: AdminUser | null;
  onLogout?: () => void;
};

export default function AdminSidebar({ user, onLogout }: Props) {
  const WIDTH_PINNED = "210px";
  const WIDTH_COLLAPSED = "72px";

  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("cnfm_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  const displayName = useMemo(() => {
    if (!user) return "Administrator";
    if (user.firstname || user.lastname) {
      return `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
    }
    if (user.username) return user.username;
    return "Administrator";
  }, [user]);

  const initials = useMemo(() => {
    const s =
      (user?.firstname?.[0] ?? "") +
      (user?.lastname?.[0] ?? user?.username?.[0] ?? "");
    return s.toUpperCase() || "A";
  }, [user]);

  const roleLabel = useMemo(() => formatRole(user?.role), [user]);
  const canManageUsers = user?.role === "super_admin";
  const showDashboardLink = user?.role !== "site_admin";

  useEffect(() => {
    const width = pinned || expanded ? WIDTH_PINNED : WIDTH_COLLAPSED;
    document.documentElement.style.setProperty("--asb-current", width);
  }, [pinned, expanded]);

  useEffect(() => {
    if (!pinned && !hovering) setExpanded(false);
  }, [location, pinned, hovering]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (pinned || !expanded) return;
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pinned, expanded]);

  const handleMouseEnter = () => {
    setHovering(true);
    setExpanded(true);
  };
  const handleMouseLeave = () => {
    setHovering(false);
    if (!pinned) setExpanded(false);
  };

  const togglePinned = () => {
    const next = !pinned;
    setPinned(next);
    setExpanded(next);
  };

  useEffect(() => {
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
      root.style.setProperty("--viewer-bg", "#f5f7fb");
      root.style.setProperty("--viewer-text", "#0f172a");
      root.style.setProperty("--viewer-panel-bg", "#ffffff");
      root.style.setProperty("--viewer-panel-border", "rgba(203,213,225,.7)");
      root.style.setProperty(
        "--viewer-panel-shadow",
        "0 16px 28px rgba(15,23,42,.08)"
      );
      root.style.setProperty("--viewer-legend-bg", "rgba(15,23,42,.06)");
      root.style.setProperty("--viewer-legend-border", "rgba(148,163,184,.4)");
      root.style.setProperty("--viewer-legend-text", "#475569");
      root.style.setProperty(
        "--viewer-legend-shadow",
        "0 8px 18px rgba(15,23,42,.08)"
      );
      root.style.setProperty("--viewer-btn-ghost-bg", "#f8fafc");
      root.style.setProperty("--viewer-btn-ghost-hover", "#e2e8f0");
      root.style.setProperty("--viewer-btn-ghost-active", "#cbd5f5");
      root.style.setProperty("--viewer-btn-ghost-text", "#0f172a");
      root.style.setProperty(
        "--viewer-btn-ghost-border",
        "rgba(148,163,184,.45)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow",
        "0 8px 18px rgba(15,23,42,.08)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow-hover",
        "0 12px 24px rgba(15,23,42,.12)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow-active",
        "0 6px 14px rgba(15,23,42,.1)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-inactive-bg",
        "rgba(148,163,184,.18)"
      );
      root.style.setProperty("--viewer-btn-ghost-inactive-text", "#475569");
      root.style.setProperty("--viewer-status-color", "#475569");
      root.style.setProperty("--viewer-empty-color", "#475569");
      root.style.setProperty(
        "--viewer-empty-bg",
        "linear-gradient(180deg, rgba(241,245,249,.8), rgba(241,245,249,.6))"
      );
      root.style.setProperty(
        "--viewer-hovercard-shadow",
        "0 18px 38px rgba(15,23,42,.15)"
      );
      root.style.setProperty(
        "--viewer-analysis-border",
        "rgba(226,232,240,.9)"
      );
      root.style.setProperty(
        "--viewer-analysis-shadow",
        "0 12px 26px rgba(15,23,42,.12)"
      );
      root.style.setProperty("--viewer-minimap-bg", "rgba(248,250,252,.95)");
      root.style.setProperty(
        "--viewer-minimap-border",
        "rgba(148,163,184,.35)"
      );
      root.style.setProperty(
        "--viewer-minimap-shadow",
        "0 12px 26px rgba(15,23,42,.12)"
      );
      root.style.setProperty("--viewer-controls-bg", "rgba(248,250,252,.95)");
      root.style.setProperty(
        "--viewer-controls-border",
        "rgba(148,163,184,.35)"
      );
      root.style.setProperty(
        "--viewer-controls-shadow",
        "0 12px 26px rgba(15,23,42,.12)"
      );
      root.style.setProperty(
        "--viewer-controls-divider",
        "rgba(148,163,184,.25)"
      );
      root.style.setProperty("--editor-shell-bg", "#f3f5fb");
      root.style.setProperty("--editor-text", "#0f172a");
      root.style.setProperty("--editor-muted", "#64748b");
      root.style.setProperty("--editor-subtext", "#475569");
      root.style.setProperty("--editor-panel", "#ffffff");
      root.style.setProperty("--editor-panel-strong", "#ffffff");
      root.style.setProperty("--editor-border", "#e5e7eb");
      root.style.setProperty("--editor-accent", "#2563eb");
      root.style.setProperty("--editor-accent-alt", "#1d4ed8");
      root.style.setProperty("--editor-status-color", "#94a3b8");
      root.style.setProperty("--editor-canvas-border", "rgba(148,163,184,.35)");
      root.style.setProperty(
        "--editor-canvas-shadow",
        "0 24px 48px rgba(15,23,42,.12)"
      );
      root.style.setProperty(
        "--editor-btn-shadow",
        "0 8px 16px rgba(15,23,42,.08)"
      );
      root.style.setProperty(
        "--editor-btn-shadow-hover",
        "0 12px 22px rgba(15,23,42,.12)"
      );
      root.style.setProperty(
        "--editor-btn-shadow-active",
        "0 6px 14px rgba(15,23,42,.1)"
      );
      root.style.setProperty("--editor-form-bg", "#f8fafc");
      root.style.setProperty("--editor-form-border", "rgba(148,163,184,.35)");
      root.style.setProperty("--editor-form-text", "#0f172a");
      root.style.setProperty("--editor-detail-muted", "#64748b");
      root.style.setProperty("--editor-switch-text", "#475569");
      root.style.setProperty("--editor-load-chip-bg", "rgba(37,99,235,.08)");
      root.style.setProperty(
        "--editor-load-chip-border",
        "rgba(59,130,246,.35)"
      );
      root.style.setProperty("--editor-load-chip-text", "#1d4ed8");
      root.style.setProperty("--editor-load-chip-remove", "#dc2626");
      root.style.setProperty("--editor-load-chip-remove-hover", "#b91c1c");
      root.style.setProperty("--editor-add-load-bg", "#ffffff");
      root.style.setProperty(
        "--editor-add-load-border",
        "rgba(148,163,184,.35)"
      );
      root.style.setProperty("--editor-add-load-text", "#0f172a");
      root.style.setProperty("--editor-detail-hint", "#64748b");
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
      root.style.setProperty(
        "--viewer-edge-structural",
        "rgba(148,163,184,.45)"
      );
      root.style.setProperty("--viewer-edge-glow", "rgba(37,99,235,.25)");
      root.style.setProperty("--viewer-edge-glow-alt", "rgba(16,185,129,.28)");
      root.style.setProperty(
        "--viewer-edge-glow-offline",
        "rgba(220,38,38,.28)"
      );
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
      root.style.setProperty("--sb-bg", "#0b1220");
      root.style.setProperty("--sb-fg", "#cbd5e1");
      root.style.setProperty("--sb-fg-dim", "#94a3b8");
      root.style.setProperty("--sb-border", "rgba(255,255,255,.08)");
      root.style.setProperty(
        "--app-shell-bg",
        "radial-gradient(circle at top left, rgba(59,130,246,.14), transparent 55%), #071426"
      );
      root.style.setProperty("--app-shell-text", "#e2e8f0");
      root.style.setProperty(
        "--footer-bg",
        "linear-gradient(135deg, #0f172a, #0b1120)"
      );
      root.style.setProperty("--footer-text", "#cbd5e1");
      root.style.setProperty("--footer-border", "rgba(37,99,235,.35)");
      root.style.setProperty("--viewer-muted", "rgba(148,163,184,.7)");
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
      root.style.setProperty("--viewer-bg", "#071426");
      root.style.setProperty("--viewer-text", "#e2e8f0");
      root.style.setProperty("--viewer-panel-bg", "rgba(15,23,42,.72)");
      root.style.setProperty("--viewer-panel-border", "rgba(148,163,184,.25)");
      root.style.setProperty(
        "--viewer-panel-shadow",
        "inset 0 0 0 1px rgba(59,130,246,.08), 0 10px 24px rgba(7,12,22,.4)"
      );
      root.style.setProperty("--viewer-legend-bg", "rgba(15,23,42,.7)");
      root.style.setProperty("--viewer-legend-border", "rgba(96,165,250,.25)");
      root.style.setProperty("--viewer-legend-text", "rgba(191,219,254,.82)");
      root.style.setProperty(
        "--viewer-legend-shadow",
        "0 8px 18px rgba(7,12,22,.4)"
      );
      root.style.setProperty("--viewer-btn-ghost-bg", "rgba(15,23,42,.65)");
      root.style.setProperty("--viewer-btn-ghost-hover", "rgba(30,41,59,.75)");
      root.style.setProperty("--viewer-btn-ghost-active", "rgba(30,41,59,.9)");
      root.style.setProperty(
        "--viewer-btn-ghost-text",
        "rgba(191,219,254,.85)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-border",
        "rgba(96,165,250,.4)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow",
        "0 8px 18px rgba(7,12,22,.35)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow-hover",
        "0 12px 26px rgba(7,12,22,.45)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-shadow-active",
        "0 6px 16px rgba(7,12,22,.4)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-inactive-bg",
        "rgba(148,163,184,.18)"
      );
      root.style.setProperty(
        "--viewer-btn-ghost-inactive-text",
        "rgba(148,163,184,.7)"
      );
      root.style.setProperty("--viewer-status-color", "rgba(148,163,184,.6)");
      root.style.setProperty("--viewer-empty-color", "rgba(191,219,254,.75)");
      root.style.setProperty(
        "--viewer-empty-bg",
        "linear-gradient(180deg, rgba(7,12,22,.78), rgba(7,12,22,.64))"
      );
      root.style.setProperty(
        "--viewer-hovercard-shadow",
        "0 18px 38px rgba(7,11,19,.6)"
      );
      root.style.setProperty(
        "--viewer-analysis-border",
        "rgba(148,163,184,.25)"
      );
      root.style.setProperty(
        "--viewer-analysis-shadow",
        "0 10px 20px rgba(15,23,42,.35)"
      );
      root.style.setProperty("--viewer-minimap-bg", "rgba(15,23,42,.72)");
      root.style.setProperty(
        "--viewer-minimap-border",
        "rgba(148,163,184,.25)"
      );
      root.style.setProperty(
        "--viewer-minimap-shadow",
        "0 12px 28px rgba(15,23,42,.35)"
      );
      root.style.setProperty("--viewer-controls-bg", "rgba(15,23,42,.72)");
      root.style.setProperty(
        "--viewer-controls-border",
        "rgba(148,163,184,.25)"
      );
      root.style.setProperty(
        "--viewer-controls-shadow",
        "0 12px 28px rgba(15,23,42,.35)"
      );
      root.style.setProperty(
        "--viewer-controls-divider",
        "rgba(148,163,184,.16)"
      );
      root.style.setProperty(
        "--editor-shell-bg",
        "radial-gradient(circle at top left, rgba(59,130,246,.12), transparent 55%), #071426"
      );
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
      root.style.setProperty("--editor-switch-text", "rgba(191,219,254,.72)");
      root.style.setProperty("--editor-load-chip-bg", "rgba(14,30,54,.8)");
      root.style.setProperty(
        "--editor-load-chip-border",
        "rgba(59,130,246,.35)"
      );
      root.style.setProperty("--editor-load-chip-text", "#bfdbfe");
      root.style.setProperty(
        "--editor-load-chip-remove",
        "rgba(248,113,113,.9)"
      );
      root.style.setProperty("--editor-load-chip-remove-hover", "#f87171");
      root.style.setProperty("--editor-add-load-bg", "rgba(7,12,22,.8)");
      root.style.setProperty(
        "--editor-add-load-border",
        "rgba(148,163,184,.3)"
      );
      root.style.setProperty("--editor-add-load-text", "#e2e8f0");
      root.style.setProperty("--editor-detail-hint", "rgba(148,163,184,.7)");
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
      root.style.setProperty(
        "--viewer-tooltip-border",
        "rgba(148,163,184,.35)"
      );
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
      root.style.setProperty(
        "--viewer-edge-structural",
        "rgba(148,163,184,.45)"
      );
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
  }, [theme]);

  const handleLogout = async () => {
    const res = await Swal.fire({
      icon: "question",
      title: "Log out?",
      text: "You’ll need to sign in again to access admin tools.",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });
    if (res.isConfirmed) {
      onLogout?.();
      navigate("/", { replace: true });
    }
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <aside
      ref={wrapRef}
      className={[
        "asb-root",
        pinned ? "pinned" : "",
        expanded ? "expanded" : "collapsed",
      ].join(" ")}
      onMouseEnter={() => !pinned && handleMouseEnter()}
      onMouseLeave={handleMouseLeave}
      aria-label="Admin navigation"
      aria-expanded={pinned || expanded}
    >
      <div className="asb-inner">
        {/* Header */}
        <button
          type="button"
          className="asb-logo-btn"
          onClick={togglePinned}
          aria-pressed={pinned}
          aria-label={pinned ? "Unpin admin sidebar" : "Pin admin sidebar"}
          title={pinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          <img
            src="/CNFM%20Logo.png"
            alt="CNFM"
            className="asb-logo"
            width={48}
            height={48}
          />
        </button>

        {/* Nav */}
        <nav className="asb-nav" aria-label="Primary">
          {showDashboardLink && (
            <AdminLink to="/admin" label="Dashboard" icon="home" />
          )}

          <AdminLink
            to="/admin/topology"
            label="Published Topology"
            icon="view"
          />
          <AdminLink
            to="/admin/topology/editor"
            label="Topology Builder"
            icon="builder"
          />

          <div className="asb-section-label">Management</div>
          {canManageUsers && (
            <AdminLink to="/admin/users" label="Users" icon="users" />
          )}
          <AdminLink to="/admin/settings" label="Settings" icon="settings" />
        </nav>

        <div className="asb-spacer" />

        {/* User card */}
        <div className="asb-usercard" title={displayName}>
          <div className="asb-avatar" aria-hidden>
            {initials}
          </div>
          <div className="asb-userinfo">
            <div className="asb-name">{displayName}</div>
            <div className="asb-role">{roleLabel}</div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="asb-footer">
          <button
            type="button"
            className="asb-link asb-theme-toggle"
            onClick={toggleTheme}
          >
            <span className="asb-ico" aria-hidden>
              {icon(theme === "light" ? "moon" : "sun")}
            </span>
            <span className="asb-label">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
          <button type="button" className="asb-link" onClick={handleLogout}>
            <span className="asb-ico" aria-hidden>
              {icon("logout")}
            </span>
            <span className="asb-label">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Helpers ---------- */
function AdminLink({
  to,
  label,
  icon: iconKey,
}: {
  to: string;
  label: string;
  icon: IconKey;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        ["asb-link", isActive ? "active" : ""].filter(Boolean).join(" ")
      }
      title={label}
    >
      <span className="asb-ico" aria-hidden>
        {icon(iconKey)}
      </span>
      <span className="asb-label">{label}</span>
    </NavLink>
  );
}

type IconKey =
  | "home"
  | "map"
  | "nodes"
  | "view"
  | "builder"
  | "users"
  | "settings"
  | "sun"
  | "moon"
  | "logout";

function icon(key: IconKey) {
  switch (key) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M4 11.5 12 4l8 7.5v7a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-7Z"
            fill="currentColor"
          />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" fill="currentColor" />
        </svg>
      );
    case "nodes":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 4a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm7 7a3 3 0 1 1-3 3 3 3 0 0 1 3-3ZM5 11a3 3 0 1 1-3 3 3 3 0 0 1 3-3Z"
            fill="currentColor"
          />
          <path
            d="M9 8l-2 2m4-2 2 2m4 1-6 3m-2-1-3 2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );
    case "view":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M1.8 12c2.3-4.8 6-7.5 10.2-7.5s7.9 2.7 10.2 7.5c-2.3 4.8-6 7.5-10.2 7.5S4.1 16.8 1.8 12Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case "builder":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M3 7h18M3 12h18M3 17h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 4v6m0 5v6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
            fill="currentColor"
          />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4Zm9 4a7.8 7.8 0 0 0-.08-1l2-1.55-2-3.46-2.36.64a8 8 0 0 0-1.72-1L14.5 2h-5l-.32 2.27a8 8 0 0 0-1.72 1L4.96 4.99l-2 3.46 2 1.55a8 8 0 0 0 0 2l-2 1.55 2 3.46 2.36-.64a8 8 0 0 0 1.72 1L9.5 22h5l.32-2.27a8 8 0 0 0 1.72-1l2.36.64 2-3.46-2-1.55a7.8 7.8 0 0 0 .08-1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 5.64a1 1 0 0 1 1.42 0L6.34 6.3A1 1 0 0 1 4.9 7.74L4.22 7.05a1 1 0 0 1 0-1.41Zm13.44 13.44a1 1 0 0 1 1.41 0l.69.69a1 1 0 0 1-1.41 1.41l-.69-.69a1 1 0 0 1 0-1.41ZM3 11h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Zm17 0h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2Zm-1.22-5.36a1 1 0 0 1 0 1.41l-.69.69A1 1 0 0 1 17.64 6.3l.69-.69a1 1 0 0 1 1.41 0ZM6.34 18.36a1 1 0 0 1 0 1.41l-.69.69a1 1 0 0 1-1.42-1.41l.69-.69a1 1 0 0 1 1.42 0Z"
            fill="currentColor"
          />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            d="M21 12.79A9 9 0 0 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
            fill="currentColor"
          />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M17 8l4 4-4 4M21 12H10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
  }
}

function formatRole(role?: UserRole) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "site_admin":
      return "Site Admin";
    case "admin":
      return "Admin";
    case "user":
      return "User";
    case "guest":
      return "Guest";
    default:
      return "Admin";
  }
}
