import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTopologyEditor from "./pages/admin/AdminTopologyEditor";
import AdminTopologyViewer from "./pages/admin/AdminTopologyViewer";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./route/ProtectedRoute"; // ⬅️ NEW
import Denied from "./pages/Denied"; // ⬅️ NEW
import PublishedTopology from "./pages/PublishedTopology";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="container py-5">
      <h1 className="h3 m-0">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC / GUEST APP */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="denied" element={<Denied />} /> {/* ⬅️ NEW */}
        <Route path="luzon" element={<Placeholder title="Luzon" />} />
        <Route path="mindanao" element={<Placeholder title="Mindanao" />} />
        <Route path="all-sites" element={<Placeholder title="All Sites" />} />
        <Route path="topology">
          <Route index element={<PublishedTopology />} />
          <Route path=":siteCode" element={<PublishedTopology />} />
        </Route>
      </Route>

      {/* ADMIN APP (guarded) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="site_admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="topology" element={<AdminTopologyViewer />} />
        <Route path="topology/editor" element={<AdminTopologyEditor />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requireRole="super_admin">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<AdminSettings />} />
        {/* more admin subroutes here */}
      </Route>
    </Routes>
  );
}
