import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { loadUser } from "../services/auth";

type Dot = { x: number; y: number };
type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const datasetTheme = document.body.dataset.theme;
  if (datasetTheme === "light" || datasetTheme === "dark") return datasetTheme;
  if (document.body.classList.contains("theme-light")) return "light";
  return "dark";
}

export default function Home() {
  const navigate = useNavigate();
  // Reduced constellation density
  const dots: Dot[] = useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
    }));
  }, []);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const handleLaunchViewer = useCallback(() => {
    const currentUser = loadUser();
    if (currentUser) {
      navigate("/admin/topology");
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  }, [navigate]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") {
        setTheme(detail);
      }
    };
    window.addEventListener("cnfm-theme-change", handler);
    return () => window.removeEventListener("cnfm-theme-change", handler);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor =
      theme === "dark" ? "#020617" : "#f8fafc";
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, [theme]);

  const statCards = [
    { label: "REGIONS", value: "3", sub: "Luzon · Visayas · Mindanao" },
    { label: "LIVE SITES", value: "90+", sub: "Core · Metro · Edge" },
    { label: "SIM SCENARIOS", value: "40+", sub: "Outage + Recovery drills" },
    { label: "TECH STACK", value: "R + TS", sub: "React · Node.js · MySQL" },
  ];

  const featureCards = [
    {
      title: "Dynamic Site Lists",
      copy: "Region-first navigation with live data sourced from MySQL. Bookmark Luzon, Visayas, or Mindanao routes instantly.",
      icon: "list",
    },
    {
      title: "Interactive Topology",
      copy: "Drag-to-pan SVG board with animated edges, alternate routing overlays, and load indicators per link.",
      icon: "globe",
    },
    {
      title: "Resiliency Scenarios",
      copy: "Simulate outages, compare bypass spans, and record recovery timelines for each network component.",
      icon: "shield",
    },
  ];

  const capabilityCards = [
    {
      label: "Realtime Insights",
      detail: "Pull live status from admin topology drafts or published views.",
    },
    {
      label: "Zero-downtime Publishing",
      detail:
        "Draft, validate, then publish updates with rollback-friendly history.",
    },
    {
      label: "Security-first",
      detail:
        "Admin dashboard protected by JWT auth plus per-route role checks.",
    },
  ];

  return (
    <div className={`home-page theme-${theme}`}>
      {/* Constellation background */}
      <div className="constellation-page" aria-hidden="true">
        {dots.map((d, i) => (
          <span
            key={i}
            className="dot"
            style={
              {
                "--rand-x": d.x,
                "--rand-y": d.y,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Content */}
      <div className="home-shell position-relative">
        {/* HERO */}
        <section className="home-hero">
          <div className="hero-content">
            <p className="hero-eyebrow">Network Simulation Platform</p>
            <h1>
              CNFM <span>Globe</span> Network War Games
            </h1>
            <p className="hero-copy">
              An interactive simulation and visualization system for analyzing
              Globe’s network routes across Luzon, Visayas, and Mindanao —
              rebuilt with React + TypeScript, Node.js, and MySQL. View routes,
              alternate paths, and real-time connectivity status in one unified
              interface.
            </p>

            <div className="hero-ctas">
              <a href="#about" className="home-cta primary">
                Learn more
              </a>
            </div>

            <div className="hero-pills">
              <span className="pill">React + TypeScript</span>
              <span className="pill">Node.js API</span>
              <span className="pill">MySQL Database</span>
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="section-header">
            <h2>Designed for situational awareness</h2>
            <p className="section-copy">
              Visualize connectivity, simulate outages, explore alternates, and
              publish updates without downtime. Every view respects the current
              light or dark theme to stay legible in any environment.
            </p>
          </div>

          <div className="stat-grid">
            {statCards.map((card) => (
              <article key={card.label} className="stat-card">
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{card.value}</p>
                <p className="stat-sub">{card.sub}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section compact">
          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="feature-card">
                <div className="feature-heading">
                  <span className="feature-icon" aria-hidden>
                    {card.icon === "list" && (
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <path
                          d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {card.icon === "globe" && (
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <path
                          d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    {card.icon === "shield" && (
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <path
                          d="M12 3l8 4v6c0 4.97-3.58 9.53-8 10-4.42-.47-8-5.03-8-10V7l8-4Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </span>
                  <h3>{card.title}</h3>
                </div>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>

          <div className="capabilities-grid">
            {capabilityCards.map((cap) => (
              <article key={cap.label} className="capability-card">
                <h3>{cap.label}</h3>
                <p>{cap.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section cta-banner">
          <div>
            <p className="section-eyebrow">Ready to explore</p>
            <h2>Jump into the topology viewer</h2>
            <p className="section-copy">
              Toggle themes, inspect services, and publish updates in seconds.
            </p>
          </div>
          <button type="button" className="home-cta primary" onClick={handleLaunchViewer}>
            Launch viewer
          </button>
        </section>
      </div>
    </div>
  );
}
