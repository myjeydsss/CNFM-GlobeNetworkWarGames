import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { FormEvent } from "react";
import Swal from "sweetalert2";
import "./AdminUsersPage.css";
import {
  fetchAdminUsers,
  createSiteAdminUser,
  updateUserAssignments,
  type AdminUserRecord,
} from "../../services/adminUsers";
import {
  listAdminSites,
  type AdminSiteSummary,
} from "../../services/adminTopology";
import { loadUser } from "../../services/auth";

type CreateFormState = {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  confirmPassword: string;
  siteIds: number[];
};

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedSiteCode = searchParams.get("siteCode") ?? "";
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteOptions, setSiteOptions] = useState<AdminSiteSummary[]>([]);
  const [siteLoading, setSiteLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<AdminUserRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    confirmPassword: "",
    siteIds: [],
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [createSiteSearch, setCreateSiteSearch] = useState(focusedSiteCode);
  const [assignSiteSearch, setAssignSiteSearch] = useState("");
  const [assignSelection, setAssignSelection] = useState<number[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const currentUser = useMemo(() => loadUser(), []);
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >(() =>
    REGION_ORDER.reduce((acc, region) => ({ ...acc, [region.code]: true }), {
      OTHER: true,
    })
  );

  useEffect(() => {
    document.title = "CNFM • User Management";
  }, []);
  useEffect(() => {
    setCreateSiteSearch(focusedSiteCode);
  }, [focusedSiteCode]);

  const clearSiteQueryParam = useCallback(() => {
    if (!focusedSiteCode) return;
    const next = new URLSearchParams(searchParams);
    next.delete("siteCode");
    setSearchParams(next, { replace: true });
  }, [focusedSiteCode, searchParams, setSearchParams]);

  const toggleRegion = useCallback((code: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  const loadSites = useCallback(async () => {
    try {
      setSiteLoading(true);
      const sites = await listAdminSites();
      setSiteOptions(sites);
    } catch (err: any) {
      console.error("site list error", err);
    } finally {
      setSiteLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await fetchAdminUsers();
      setUsers(list);
    } catch (err: any) {
      setError(err?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadSites();
  }, [loadUsers, loadSites]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (!assignUser) return;
    setAssignSelection(assignUser.assignedSites.map((site) => site.siteId));
    setAssignSiteSearch("");
  }, [assignUser]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (currentUser?.role === "super_admin" && currentUser.id === user.id) {
        return false;
      }
      if (!term) return true;
      const full = `${user.firstname ?? ""} ${user.lastname ?? ""}`
        .trim()
        .toLowerCase();
      return (
        full.includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(filteredUsers.length, 1) / PAGE_SIZE)
  );
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const showingStart = filteredUsers.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const showingEnd = filteredUsers.length
    ? Math.min(filteredUsers.length, currentPage * PAGE_SIZE)
    : 0;

  const filteredCreateSites = useMemo(() => {
    if (!createSiteSearch.trim()) return siteOptions;
    const term = createSiteSearch.trim().toLowerCase();
    return siteOptions.filter(
      (site) =>
        site.name.toLowerCase().includes(term) ||
        site.code.toLowerCase().includes(term) ||
        site.regionName.toLowerCase().includes(term)
    );
  }, [siteOptions, createSiteSearch]);

  const filteredAssignSites = useMemo(() => {
    if (!assignSiteSearch.trim()) return siteOptions;
    const term = assignSiteSearch.trim().toLowerCase();
    return siteOptions.filter(
      (site) =>
        site.name.toLowerCase().includes(term) ||
        site.code.toLowerCase().includes(term) ||
        site.regionName.toLowerCase().includes(term)
    );
  }, [siteOptions, assignSiteSearch]);

  const groupedCreateSites = useMemo(
    () => groupSitesByRegion(filteredCreateSites),
    [filteredCreateSites]
  );
  const groupedAssignSites = useMemo(
    () => groupSitesByRegion(filteredAssignSites),
    [filteredAssignSites]
  );

  const handleCreateToggle = useCallback(() => {
    setCreateOpen((prev) => {
      const next = !prev;
      if (next) {
        setCreateForm({
          firstname: "",
          lastname: "",
          username: "",
          password: "",
          confirmPassword: "",
          siteIds: [],
        });
        setShowCreatePassword(false);
        setShowCreateConfirm(false);
      } else {
        clearSiteQueryParam();
        setShowCreatePassword(false);
        setShowCreateConfirm(false);
      }
      return next;
    });
  }, [clearSiteQueryParam]);

  const toggleCreateSite = (id: number) => {
    setCreateForm((prev) => ({
      ...prev,
      siteIds: prev.siteIds.includes(id)
        ? prev.siteIds.filter((item) => item !== id)
        : prev.siteIds.concat(id),
    }));
  };

  const toggleAssignSite = (id: number) => {
    setAssignSelection((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : prev.concat(id)
    );
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating) return;
    if (!createForm.username.trim()) {
      Swal.fire("Missing username", "Username is required.", "info");
      return;
    }
    if (!createForm.password || createForm.password.length < 10) {
      Swal.fire(
        "Weak password",
        "Password must be at least 10 characters long.",
        "warning"
      );
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      Swal.fire("Mismatch", "Passwords do not match.", "warning");
      return;
    }
    if (!createForm.siteIds.length) {
      Swal.fire(
        "Assign a site",
        "Select at least one site for this site admin.",
        "info"
      );
      return;
    }
    try {
      setCreating(true);
      const normalizedUsername = createForm.username.trim();
      await createSiteAdminUser({
        firstname: createForm.firstname.trim(),
        lastname: createForm.lastname.trim(),
        username: normalizedUsername,
        password: createForm.password,
        siteIds: createForm.siteIds,
      });
      await loadUsers();
      await loadSites();
      window.dispatchEvent(new Event("cnfm-sites-refresh"));
      setCreateOpen(false);
      setShowCreatePassword(false);
      setShowCreateConfirm(false);
      clearSiteQueryParam();
      Swal.fire({
        icon: "success",
        title: "Site admin created",
        text: "Share the temporary password with the user. They will be asked to set a new one after logging in.",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err?.message || "Unable to create site admin.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAssignmentSave = async () => {
    if (!assignUser) return;
    try {
      setSavingAssignments(true);
      await updateUserAssignments(assignUser.id, assignSelection);
      await loadUsers();
      await loadSites();
      window.dispatchEvent(new Event("cnfm-sites-refresh"));
      setAssignUser(null);
      Swal.fire({
        icon: "success",
        title: "Assignments updated",
        text: "Site access was updated for this user.",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err?.message || "Unable to update assignments.",
      });
    } finally {
      setSavingAssignments(false);
    }
  };

  const createDisabled =
    creating ||
    !createForm.username.trim() ||
    !createForm.password ||
    createForm.password !== createForm.confirmPassword ||
    !createForm.siteIds.length;

  return (
    <div className="admin-users">
      <header className="users-header">
        <div>
          <p className="users-eyebrow">Management</p>
          <h1>User Access Control</h1>
          <p className="users-sub">
            Create site admins and grant them access to the topology builder for
            specific sites.
          </p>
        </div>
        <div className="users-header-actions">
          <input
            type="search"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="users-btn primary"
            onClick={handleCreateToggle}
          >
            New Site Admin
          </button>
        </div>
      </header>

      {error ? (
        <div className="users-error">
          <p>{error}</p>
          <button type="button" onClick={loadUsers}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="users-panel">
        {loading ? (
          <div className="users-placeholder">Loading users…</div>
        ) : filteredUsers.length ? (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Sites</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name">
                        {[user.firstname, user.lastname]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || user.username}
                      </div>
                    </td>
                    <td>
                      <span className={`role-chip role-${user.role}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td>
                      {user.assignedSites.length ? (
                        <div className="site-chip-wrap">
                          {user.assignedSites.slice(0, 3).map((site) => (
                            <span key={site.siteId} className="site-chip">
                              {site.name}{" "}
                              <small>
                                (
                                {site.regionName && site.regionName.length
                                  ? site.regionName
                                  : "Unassigned"}
                                )
                              </small>
                            </span>
                          ))}
                          {user.assignedSites.length > 3 ? (
                            <span className="site-chip more">
                              +{user.assignedSites.length - 3} more
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="users-muted">No sites assigned</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          user.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="users-btn pill"
                          onClick={() => setAssignUser(user)}
                        >
                          Assign sites
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="users-pagination">
              <span>
                Showing {showingStart}-{showingEnd} of {filteredUsers.length}
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pager-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M15 18l-6-6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="pager-meta">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="pager-btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path
                      d="M9 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="users-placeholder">No users found.</div>
        )}
      </section>

      {createOpen && (
        <div className="users-modal" role="dialog" aria-modal="true">
          <div
            className="users-modal-backdrop"
            onClick={() => !creating && setCreateOpen(false)}
          />
          <div className="users-modal-content">
            <header>
              <h2>New Site Admin</h2>
              <p>
                Create an account and assign the sites this user will manage. A
                temporary password is required.
              </p>
            </header>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-grid">
                <label className="floating-input users-field">
                  <span>Firstname (Optional)</span>
                  <input
                    type="text"
                    value={createForm.firstname}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        firstname: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="floating-input users-field">
                  <span>Lastname (Optional)</span>
                  <input
                    type="text"
                    value={createForm.lastname}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        lastname: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              <label className="floating-input users-field full-width">
                <span>Username</span>
                <input
                  type="text"
                  placeholder="e.g. Davao_Site"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                />
              </label>
              <div className="form-grid">
                <label className="floating-input users-password-field">
                  <span>Temporary password</span>
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="visibility-toggle"
                    onClick={() => setShowCreatePassword((s) => !s)}
                  >
                    {showCreatePassword ? "Hide" : "Show"}
                  </button>
                </label>
                <label className="floating-input users-password-field">
                  <span>Confirm password</span>
                  <input
                    type={showCreateConfirm ? "text" : "password"}
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="visibility-toggle"
                    onClick={() => setShowCreateConfirm((s) => !s)}
                  >
                    {showCreateConfirm ? "Hide" : "Show"}
                  </button>
                </label>
              </div>
              <div className="site-select">
                <div className="site-select-header">
                  <div>
                    <span>Assign sites</span>
                    <p>
                      {siteLoading
                        ? "Loading site list…"
                        : "Choose one or more sites this admin can manage."}
                    </p>
                  </div>
                  <input
                    type="search"
                    placeholder="Search sites"
                    value={createSiteSearch}
                    onChange={(e) => setCreateSiteSearch(e.target.value)}
                    disabled={siteLoading}
                  />
                </div>
                {siteLoading ? (
                  <p className="users-muted">Fetching sites…</p>
                ) : groupedCreateSites.some((group) => group.sites.length) ? (
                  groupedCreateSites.map((group) => (
                    <section
                      key={`create-${group.code}`}
                      className="site-region-block"
                    >
                      <button
                        type="button"
                        className="site-region-header"
                        onClick={() => toggleRegion(group.code)}
                        aria-expanded={!!expandedRegions[group.code]}
                      >
                        <h4>{group.label}</h4>
                        <span className="region-toggle" aria-hidden="true">
                          <ChevronIcon open={!!expandedRegions[group.code]} />
                        </span>
                      </button>
                      {expandedRegions[group.code] ? (
                        group.sites.length ? (
                          <div className="site-region-grid">
                            {group.sites.map((site) => {
                              const selected = createForm.siteIds.includes(
                                site.id
                              );
                              return (
                                <label
                                  key={site.id}
                                  className={`site-option ${
                                    selected ? "selected" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleCreateSite(site.id)}
                                  />
                                  <span className="site-name">{site.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="users-muted region-empty">
                            No sites available for now.
                          </p>
                        )
                      ) : null}
                    </section>
                  ))
                ) : (
                  <p className="users-muted">No sites match this search.</p>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="users-btn ghost"
                  onClick={() => {
                    if (creating) return;
                    setCreateOpen(false);
                    setShowCreatePassword(false);
                    setShowCreateConfirm(false);
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="users-btn primary"
                  disabled={createDisabled}
                >
                  {creating ? "Saving…" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignUser && (
        <div className="users-modal" role="dialog" aria-modal="true">
          <div
            className="users-modal-backdrop"
            onClick={() => !savingAssignments && setAssignUser(null)}
          />
          <div className="users-modal-content">
            <header>
              <h2>Assign sites</h2>
              <p>
                {assignUser.firstname} {assignUser.lastname} ·{" "}
                {assignUser.username}
              </p>
            </header>
            <div className="site-select">
              <div className="site-select-header">
                <div>
                  <span>Available sites</span>
                  <p>Select or deselect sites to update access.</p>
                </div>
                <input
                  type="search"
                  placeholder="Search sites"
                  value={assignSiteSearch}
                  onChange={(e) => setAssignSiteSearch(e.target.value)}
                  disabled={siteLoading}
                />
              </div>
              {siteLoading ? (
                <p className="users-muted">Loading sites…</p>
              ) : groupedAssignSites.some((group) => group.sites.length) ? (
                groupedAssignSites.map((group) => (
                  <section
                    key={`assign-${group.code}`}
                    className="site-region-block"
                  >
                    <button
                      type="button"
                      className="site-region-header"
                      onClick={() => toggleRegion(group.code)}
                      aria-expanded={!!expandedRegions[group.code]}
                    >
                      <h4>{group.label}</h4>
                      <span className="region-toggle" aria-hidden="true">
                        <ChevronIcon open={!!expandedRegions[group.code]} />
                      </span>
                    </button>
                    {expandedRegions[group.code] ? (
                      group.sites.length ? (
                        <div className="site-region-grid">
                          {group.sites.map((site) => {
                            const selected = assignSelection.includes(site.id);
                            return (
                              <label
                                key={site.id}
                                className={`site-option ${
                                  selected ? "selected" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleAssignSite(site.id)}
                                />
                                <span className="site-name">{site.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="users-muted region-empty">
                          No sites available for now.
                        </p>
                      )
                    ) : null}
                  </section>
                ))
              ) : (
                <p className="users-muted">No sites match this search.</p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="users-btn ghost"
                onClick={() => !savingAssignments && setAssignUser(null)}
                disabled={savingAssignments}
              >
                Cancel
              </button>
              <button
                type="button"
                className="users-btn primary"
                onClick={handleAssignmentSave}
                disabled={savingAssignments}
              >
                {savingAssignments ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRole(role: string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "site_admin":
      return "Site Admin";
    case "admin":
      return "Admin";
    case "user":
      return "User";
    case "guest":
      return "Guest";
    default:
      return role;
  }
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={open ? "chevron open" : "chevron"}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const REGION_ORDER = [
  { code: "LUZON", label: "Luzon" },
  { code: "VISAYAS", label: "Visayas" },
  { code: "MINDANAO", label: "Mindanao" },
];

function groupSitesByRegion(list: AdminSiteSummary[]) {
  const groups = REGION_ORDER.map((region) => ({
    code: region.code,
    label: region.label,
    sites: [] as AdminSiteSummary[],
  }));
  const other: AdminSiteSummary[] = [];

  list.forEach((site) => {
    const regionCode = (site.regionCode || "").toUpperCase();
    const group = groups.find((g) => g.code === regionCode);
    if (group) {
      group.sites.push(site);
    } else {
      other.push(site);
    }
  });

  if (other.length) {
    groups.push({
      code: "OTHER",
      label: "Other regions",
      sites: other,
    });
  }

  return groups;
}
