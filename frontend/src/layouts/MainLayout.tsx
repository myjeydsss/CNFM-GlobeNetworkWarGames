import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../components/Sidebar.css";

export default function MainLayout() {
  const location = useLocation();
  return (
    <div className="d-flex">
      <Sidebar />

      {/* The right content adjusts automatically */}
      <div className="app-shell flex-grow-1">
        <main className="py-4 px-3 px-md-4">
          <div key={location.pathname} className="viewer-page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
