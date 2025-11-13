import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../components/Sidebar.css";

export default function MainLayout() {
  return (
    <div className="d-flex">
      <Sidebar />

      {/* The right content adjusts automatically */}
      <div className="app-shell flex-grow-1">
        <main className="py-4 px-3 px-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
