import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const navRef = useRef<HTMLUListElement>(null);
  const location = useLocation();

  // Hide/show on scroll (down hides after 120px, up shows)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScroll && y > 120) setHidden(true);
      else setHidden(false);
      setLastScroll(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScroll]);

  // Move active indicator under current link
  useEffect(() => {
    if (!navRef.current) return;
    const active =
      navRef.current.querySelector<HTMLAnchorElement>(".nav-link.active");
    if (active) {
      const rect = active.getBoundingClientRect();
      const parent = navRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: `${rect.left - parent.left}px`,
        width: `${rect.width}px`,
      });
    } else {
      setIndicatorStyle({ left: "0px", width: "0px" });
    }
  }, [location]);

  return (
    <>
      {/* The subtle "peek" glow bar that remains when navbar is hidden */}
      <div className={`nav-peek ${hidden ? "show" : ""}`} aria-hidden />

      <nav
        className={`navbar navbar-expand-md fixed-top glass-nav border-bottom ${
          hidden ? "navbar-hidden" : ""
        } navbar-light`}
      >
        <div className="container py-2 position-relative">
          {/* Brand */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img
              src="/CNFM%20Logo.png"
              alt="CNFM"
              width={36}
              height={36}
              className="rounded-circle border-subtle"
            />
            <span className="fw-semibold text-dark brand-title">
              CNFM <span className="text-primary">Network War Games</span>
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Links */}
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto position-relative" ref={navRef}>
              <li className="nav-item">
                <AnimatedLink to="/">Home</AnimatedLink>
              </li>
              <li className="nav-item">
                <AnimatedLink to="/luzon">Luzon</AnimatedLink>
              </li>
              <li className="nav-item">
                <AnimatedLink to="/visayas">Visayas</AnimatedLink>
              </li>
              <li className="nav-item">
                <AnimatedLink to="/mindanao">Mindanao</AnimatedLink>
              </li>
              <li className="nav-item">
                <AnimatedLink to="/all-sites">All Sites</AnimatedLink>
              </li>

              {/* sliding active indicator */}
              <div className="nav-indicator" style={indicatorStyle} />
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

function AnimatedLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      end
      to={to}
      className={({ isActive }) =>
        [
          "nav-link px-3 py-2 position-relative link-underline fw-medium",
          isActive ? "active text-dark" : "text-body",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
