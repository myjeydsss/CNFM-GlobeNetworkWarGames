import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useId,
  useCallback,
} from "react";
import Swal from "sweetalert2";
import "./AdminSettings.css";
import {
  changePassword,
  updateProfile,
  saveAuth,
  loadUser,
} from "../../services/auth";

export default function AdminSettings() {
  const [currentUser, setCurrentUser] = useState(loadUser());
  useEffect(() => {
    const handler = () => setCurrentUser(loadUser());
    window.addEventListener("cnfm-auth-changed", handler);
    return () => window.removeEventListener("cnfm-auth-changed", handler);
  }, []);
  const [profileForm, setProfileForm] = useState({
    firstname: currentUser?.firstname ?? "",
    lastname: currentUser?.lastname ?? "",
    username: currentUser?.username ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });

  useEffect(() => {
    setProfileForm({
      firstname: currentUser?.firstname ?? "",
      lastname: currentUser?.lastname ?? "",
      username: currentUser?.username ?? "",
    });
  }, [currentUser?.firstname, currentUser?.lastname, currentUser?.username]);

  const profileDirty = useMemo(() => {
    return (
      profileForm.firstname !== (currentUser?.firstname ?? "") ||
      profileForm.lastname !== (currentUser?.lastname ?? "") ||
      profileForm.username !== (currentUser?.username ?? "")
    );
  }, [profileForm, currentUser]);
  const handleCloseProfileModal = useCallback(() => {
    setProfileModalOpen(false);
    setProfileForm({
      firstname: currentUser?.firstname ?? "",
      lastname: currentUser?.lastname ?? "",
      username: currentUser?.username ?? "",
    });
  }, [currentUser?.firstname, currentUser?.lastname, currentUser?.username]);
  const handleClosePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordVisibility({
      current: false,
      newPwd: false,
      confirm: false,
    });
  }, []);
  const togglePasswordVisibility = useCallback(
    (field: "current" | "newPwd" | "confirm") => {
      setPasswordVisibility((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    []
  );
  const displayName = useMemo(() => {
    if (!currentUser) return "Unknown user";
    const parts = [currentUser.firstname, currentUser.lastname]
      .filter(Boolean)
      .join(" ")
      .trim();
    return parts || currentUser.username || "Unknown user";
  }, [currentUser]);
  const initials = useMemo(() => {
    if (!currentUser) return "??";
    const source =
      [currentUser.firstname, currentUser.lastname].filter(Boolean).join("") ||
      currentUser.username;
    if (!source) return "??";
    const letters = source
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 2)
      .toUpperCase();
    if (letters.length === 2) return letters;
    if (letters.length === 1) return `${letters}•`;
    return "??";
  }, [currentUser]);
  const roleLabel = useMemo(() => {
    const role = currentUser?.role ?? "user";
    return role
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [currentUser?.role]);
  const statusLabel = currentUser?.mustChangePassword
    ? "Password update required"
    : "Active";

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profileForm.username.trim()) {
      Swal.fire("Username required", "Provide a username.", "info");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await updateProfile({
        firstname: profileForm.firstname.trim(),
        lastname: profileForm.lastname.trim(),
        username: profileForm.username.trim(),
      });
      saveAuth(res.token, res.user);
      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your account details were saved.",
      });
      handleCloseProfileModal();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err?.message || "Unable to update profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentPassword.trim()) {
      Swal.fire("Missing password", "Enter your current password.", "info");
      return;
    }
    if (newPassword.length < 10) {
      Swal.fire(
        "Weak password",
        "New password must be at least 10 characters.",
        "warning"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire("Mismatch", "New passwords do not match.", "warning");
      return;
    }

    try {
      setSaving(true);
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      saveAuth(res.token, res.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "You can continue using the admin portal.",
      });
      handleClosePasswordModal();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err?.message || "Unable to update password.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-settings">
      <header>
        <p className="eyebrow">Preferences</p>
        <h1>Account Settings</h1>
        <p className="subtext">
          Manage your profile, username, and password. Temporary passwords must
          be replaced before accessing topology tools.
        </p>
      </header>

      <section className="profile-summary-card">
        <div className="summary-main">
          <div className="summary-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <p className="summary-eyebrow">My profile</p>
            <h2>{displayName}</h2>
            <p className="summary-role">{roleLabel}</p>
          </div>
        </div>
        <div className="summary-actions">
          <span
            className={`status-pill ${
              currentUser?.mustChangePassword ? "status-warning" : ""
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </section>

      <div className="profile-sections">
        <article className="profile-card">
          <header className="profile-card__header">
            <div className="header-row">
              <p className="subheading">Personal information</p>
              <button
                type="button"
                className="card-edit"
                onClick={() => setProfileModalOpen(true)}
                aria-label="Edit personal information"
              >
                ✎<span className="sr-only">Edit personal information</span>
              </button>
            </div>
          </header>
          <dl className="profile-grid">
            <div>
              <dt>First name</dt>
              <dd>{currentUser?.firstname || "—"}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{currentUser?.lastname || "—"}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{currentUser?.username || "—"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{roleLabel}</dd>
            </div>
          </dl>
        </article>

        <article className="profile-card">
          <header className="profile-card__header">
            <div className="header-row">
              <div>
                <p className="subheading">Security</p>
                <h3>Password</h3>
              </div>
              <button
                type="button"
                className="card-edit"
                onClick={() => setPasswordModalOpen(true)}
                aria-label="Update password"
              >
                ✎<span className="sr-only">Update password</span>
              </button>
            </div>
            <p className="description">
              Set a strong passphrase and update temporary credentials right
              away.
            </p>
          </header>
          <ul className="tips">
            <li>Use at least 10 characters.</li>
            <li>Mix letters, numbers, and symbols.</li>
            <li>Never reuse passwords from other tools.</li>
          </ul>
          {currentUser?.mustChangePassword && (
            <p className="notice">
              A password update is required before you can continue using the
              admin tools.
            </p>
          )}
        </article>
      </div>

      {profileModalOpen && (
        <SettingsModal title="Edit profile" onClose={handleCloseProfileModal}>
          <form className="modal-form" onSubmit={handleProfileSubmit}>
            <div className="input-grid inline">
              <label className="floating-input">
                <span>Firstname</span>
                <input
                  type="text"
                  value={profileForm.firstname}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      firstname: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="floating-input">
                <span>Lastname</span>
                <input
                  type="text"
                  value={profileForm.lastname}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      lastname: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="floating-input">
              <span>Username</span>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost"
                onClick={handleCloseProfileModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={profileSaving || !profileDirty}
              >
                {profileSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </SettingsModal>
      )}

      {passwordModalOpen && (
        <SettingsModal
          title="Update password"
          onClose={handleClosePasswordModal}
        >
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="floating-input full-row with-toggle">
              <span>Current password</span>
              <input
                id="currentPassword"
                type={passwordVisibility.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="visibility-toggle"
                onClick={() => togglePasswordVisibility("current")}
                aria-label={
                  passwordVisibility.current
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {passwordVisibility.current ? "Hide" : "Show"}
              </button>
            </label>
            <label className="floating-input full-row with-toggle">
              <span>New password</span>
              <input
                id="newPassword"
                type={passwordVisibility.newPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 10 characters"
              />
              <button
                type="button"
                className="visibility-toggle"
                onClick={() => togglePasswordVisibility("newPwd")}
                aria-label={
                  passwordVisibility.newPwd
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {passwordVisibility.newPwd ? "Hide" : "Show"}
              </button>
            </label>
            <label className="floating-input full-row with-toggle">
              <span>Confirm password</span>
              <input
                id="confirmPassword"
                type={passwordVisibility.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="visibility-toggle"
                onClick={() => togglePasswordVisibility("confirm")}
                aria-label={
                  passwordVisibility.confirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {passwordVisibility.confirm ? "Hide" : "Show"}
              </button>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="ghost"
                onClick={handleClosePasswordModal}
              >
                Cancel
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {saving ? "Saving…" : "Update password"}
              </button>
            </div>
          </form>
        </SettingsModal>
      )}
    </section>
  );
}

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function SettingsModal({ title, onClose, children }: ModalProps) {
  const headingId = useId();
  return (
    <div
      className="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="settings-modal__backdrop" onClick={onClose} />
      <div className="settings-modal__dialog">
        <div className="settings-modal__header">
          <div>
            <h3 id={headingId}>{title}</h3>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="settings-modal__body">{children}</div>
      </div>
    </div>
  );
}
