import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Denied.css";

type Theme = "light" | "dark";

function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const explicit = document.body.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return document.body.classList.contains("theme-light") ? "light" : "dark";
}

export default function Denied() {
  const [theme, setTheme] = useState<Theme>(getTheme);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    window.addEventListener("cnfm-theme-change", handler);
    return () => window.removeEventListener("cnfm-theme-change", handler);
  }, []);

  const handleOpenLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  }, []);

  return (
    <div className={`denied-page theme-${theme}`}>
      <div className="denied-card">
        <div className="denied-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="42" height="42" role="img" aria-label="Lock">
            <path
              d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-6 7.73V18a1 1 0 0 0 2 0v-1.27a2 2 0 1 0-2 0ZM10 7a2 2 0 0 1 4 0v2h-4Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="denied-eyebrow">Restricted</p>
        <h1>Access denied</h1>
        <p className="denied-copy">
          This area is limited to authorized CNFM operators. Sign in to continue or
          return to the public dashboard.
        </p>

        <div className="denied-actions">
          <button type="button" className="denied-btn primary" onClick={handleOpenLogin}>
            Sign in
          </button>
          <Link className="denied-btn secondary" to="/">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
