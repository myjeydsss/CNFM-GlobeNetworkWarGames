import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../services/auth";
import {
  fetchDashboardOverview,
  type DashboardOverview,
} from "../../services/dashboard";
import "./AdminDashboard.css";

type MetricKey = keyof DashboardOverview["metrics"];

const METRIC_CONFIG: Array<{
  key: MetricKey;
  label: string;
  accent: "blue" | "indigo" | "teal" | "amber" | "rose" | "slate";
}> = [
  { key: "regions", label: "Regions", accent: "blue" },
  { key: "sites", label: "Sites", accent: "indigo" },
  { key: "publishedSites", label: "Published sites", accent: "rose" },
  {
    key: "draftsUpdated24h",
    label: "Drafts updated (24h)",
    accent: "slate",
  },
];

function formatDateTime(value: string) {
  if (!value) return "Unknown";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(dt);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => loadUser(), []);
  const isSuperAdmin = user?.role === "super_admin";
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "CNFM • Admin Dashboard";
  }, []);

  const name = useMemo(() => {
    if (!user) return "Admin";
    const full = [user.firstname, user.lastname].filter(Boolean).join(" ").trim();
    return full || user.username || "Admin";
  }, [user]);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/admin/topology", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardOverview();
        if (!cancelled) setOverview(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <p className="dashboard-eyebrow">Control center</p>
          <h1>Welcome, {name}</h1>
          <p className="dashboard-sub">
            Real-time glance at regions, sites, and topology activity.
          </p>
        </div>
        <div
          className={`dashboard-status ${
            loading ? "loading" : error ? "error" : "ok"
          }`}
        >
          <span className="status-dot" />
          {loading ? "Loading…" : error ? "Attention" : "Operational"}
        </div>
      </header>

      {error ? (
        <div className="dashboard-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardOverview()
                .then((data) => setOverview(data))
                .catch((err: any) =>
                  setError(err?.message || "Unable to load dashboard.")
                )
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="dashboard-metrics">
        {METRIC_CONFIG.map(({ key, label, accent }) => (
          <article
            key={key}
            className={`metric-card accent-${accent} ${
              loading ? "metric-loading" : ""
            }`}
            tabIndex={0}
          >
            <span className="metric-label">{label}</span>
            <span className="metric-value">
              {loading
                ? "—"
                : (overview?.metrics[key] ?? 0).toLocaleString("en-US")}
            </span>
          </article>
        ))}
      </section>

      <section className="dashboard-panels">
        <article className="panel">
          <header className="panel-header">
            <h2>Network by Region</h2>
            {!loading && overview ? (
              <span className="panel-meta">
                {overview.regionBreakdown.reduce(
                  (acc, region) => acc + region.siteCount,
                  0
                )}{" "}
                sites across {overview.regionBreakdown.length} regions
              </span>
            ) : null}
          </header>
          <div className="panel-body">
            {loading ? (
              <div className="panel-placeholder" aria-live="polite">
                Gathering region data…
              </div>
            ) : overview && overview.regionBreakdown.length ? (
              <table className="region-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th className="align-right">Sites</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.regionBreakdown.map((region) => (
                    <tr key={region.code}>
                      <td>
                        <div className="region-name">{region.name}</div>
                        <div className="region-code">{region.code}</div>
                      </td>
                      <td className="align-right">
                        {region.siteCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="panel-placeholder">
                No regions have been configured yet.
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Recent Topology Updates</h2>
            {!loading && overview ? (
              <span className="panel-meta">
                Last 24h updates: {overview.metrics.draftsUpdated24h}
              </span>
            ) : null}
          </header>
          <div className="panel-body">
            {loading ? (
              <div className="panel-placeholder" aria-live="polite">
                Checking draft history…
              </div>
            ) : overview && overview.recentActivity.length ? (
              <ul className="activity-list">
                {overview.recentActivity.map((item) => (
                  <li key={`${item.siteId}-${item.updatedAt}`}>
                    <div className="activity-title">
                      <span className="activity-site">{item.siteName}</span>
                      <span className="activity-code">{item.siteCode}</span>
                    </div>
                    <div className="activity-meta">
                      <span>{formatDateTime(item.updatedAt)}</span>
                      <span className="separator">•</span>
                      <span>{item.actor}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="panel-placeholder">
                No topology drafts have been updated yet.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
