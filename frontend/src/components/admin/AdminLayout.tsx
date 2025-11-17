import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../components/admin/AdminSidebar.css";
import { useEffect } from "react";
import { clearAuth, loadUser } from "../../services/auth";

export default function AdminLayout() {
  const user = loadUser();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    // clean up legacy keys from prior builds
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  // Set a sane default offset for the admin shell (in case CSS var not set yet)
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--asb-current")
      .trim();
    if (!v) {
      document.documentElement.style.setProperty("--asb-current", "210px");
    }
  }, []);

  return (
    <>
      <a href="#admin-main" className="asb-skip-link">
        Skip to content
      </a>
      <AdminSidebar user={user} onLogout={handleLogout} />
      <main id="admin-main" className="admin-shell">
        <div
          key={location.pathname}
          className="admin-page-transition"
          aria-live="polite"
        >
          <Outlet />
        </div>
      </main>
    </>
  );
}
