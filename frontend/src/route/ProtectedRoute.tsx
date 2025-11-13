import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  loadToken,
  loadUser,
  getMe,
  saveAuth,
  clearAuth,
} from "../services/auth";
import type { UserRole } from "../services/auth";

type Props = {
  children: React.ReactNode;
  requireRole?: UserRole;
};

export default function ProtectedRoute({
  children,
  requireRole = "site_admin",
}: Props) {
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");
  const [user, setUser] = useState(loadUser());
  const location = useLocation();

  useEffect(() => {
    const handler = () => setUser(loadUser());
    window.addEventListener("cnfm-auth-changed", handler);
    return () => window.removeEventListener("cnfm-auth-changed", handler);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = loadToken();
      if (!token) {
        mounted && setState("denied");
        return;
      }

      // quick local check
      const cached = loadUser();
      if (cached && roleAllows(cached.role, requireRole)) {
        mounted && setState("ok");
        // background verify
        const fresh = await getMe();
        if (!fresh || !roleAllows(fresh.role, requireRole)) {
          clearAuth();
          mounted && setState("denied");
        } else {
          saveAuth(token, fresh);
          mounted && setUser(fresh);
        }
        return;
      }

      // no cached user, verify from server
      const fresh = await getMe();
      if (fresh && roleAllows(fresh.role, requireRole)) {
        saveAuth(token!, fresh);
        mounted && setUser(fresh);
        mounted && setState("ok");
      } else {
        clearAuth();
        mounted && setState("denied");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [requireRole]);

  if (state === "checking") return null; // or a spinner
  if (state === "denied") return <Navigate to="/denied" replace />;

  const mustReset = user?.mustChangePassword;
  const onSettingsPage = location.pathname.startsWith("/admin/settings");
  if (mustReset && !onSettingsPage) {
    return <Navigate to="/admin/settings" replace />;
  }

  return <>{children}</>;
}

function roleAllows(actual: UserRole, required: UserRole) {
  const rank: Record<UserRole, number> = {
    guest: 0,
    user: 1,
    site_admin: 2,
    admin: 3,
    super_admin: 4,
  };
  return (rank[actual] ?? 0) >= (rank[required] ?? 0);
}
