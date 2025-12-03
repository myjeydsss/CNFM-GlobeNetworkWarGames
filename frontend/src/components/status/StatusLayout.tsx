import { ReactNode, useEffect, useState } from "react";
import "./status.css";

type Theme = "light" | "dark";

function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const explicit = document.body.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return document.body.classList.contains("theme-light") ? "light" : "dark";
}

type StatusLayoutProps = {
  title: string;
  message: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  actions?: ReactNode;
  hint?: string;
};

export default function StatusLayout({
  title,
  message,
  imageSrc,
  imageAlt,
  eyebrow,
  actions,
  hint,
}: StatusLayoutProps) {
  const [theme, setTheme] = useState<Theme>(getTheme);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") setTheme(detail);
    };
    window.addEventListener("cnfm-theme-change", handler);
    return () => window.removeEventListener("cnfm-theme-change", handler);
  }, []);

  return (
    <div className={`status-page theme-${theme}`}>
      <div className="status-card">
        <div className="status-visual">
          <img src={imageSrc} alt={imageAlt} />
        </div>
        <div className="status-copy">
          {eyebrow ? <p className="status-eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p className="status-message">{message}</p>
          {hint ? <p className="status-hint">{hint}</p> : null}
          {actions ? <div className="status-actions">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
