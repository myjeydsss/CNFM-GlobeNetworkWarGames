import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { register as registerApi } from "../../services/auth";
import "./LoginModal.css"; // shared auth styles

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenLogin?: () => void;
};

export default function RegisterModal({
  open,
  onClose,
  onSuccess,
  onOpenLogin,
}: Props) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");
  const [role, setRole] = useState<"admin" | "guest">("admin");

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset & focus handling
  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    } else {
      setFirstname("");
      setLastname("");
      setUsername("");
      setPwd("");
      setCpwd("");
      setRole("admin");
      setShowPwd(false);
      setErr(null);
      setLoading(false);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Click outside to close
  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!firstname.trim()) return setErr("First name is required.");
    if (!lastname.trim()) return setErr("Last name is required.");
    if (!/^[a-zA-Z0-9._-]{3,}$/.test(username.trim()))
      return setErr(
        "Username must be at least 3 characters and may contain letters, numbers, dots, underscores, or hyphens."
      );
    if (pwd.length < 8)
      return setErr("Password must be at least 8 characters.");
    if (pwd !== cpwd) return setErr("Passwords do not match.");

    try {
      setLoading(true);
      await registerApi({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        username: username.trim(),
        password: pwd,
        role,
      });
      Swal.fire({
        icon: "success",
        title: "Account created",
        text: "You can now sign in with your new credentials.",
        confirmButtonText: "Go to sign in",
        confirmButtonColor: "#2563eb",
        background: "#0b1220",
        color: "#e2e8f0",
      }).then(() => {
        onSuccess?.();
        onClose();
        onOpenLogin?.();
      });
    } catch (error: any) {
      setErr(error?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="auth-overlay"
      onMouseDown={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      id="register-modal"
    >
      <div className="auth-card" role="document">
        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close registration dialog"
        >
          ×
        </button>

        <form
          className="auth-pane auth-pane--form auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="auth-heading">
            <h3 id="register-title">Create your operator account</h3>
            <p>
              Introduce yourself and choose your access level to start managing
              simulations.
            </p>
          </div>

          {err && (
            <div className="auth-alert" role="alert">
              {err}
            </div>
          )}

          <div className="auth-form-grid two">
            <label className="auth-field">
              <span>FIRST NAME</span>
              <input
                ref={firstFieldRef}
                type="text"
                autoComplete="given-name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Juan"
                required
              />
            </label>

            <label className="auth-field">
              <span>LAST NAME</span>
              <input
                type="text"
                autoComplete="family-name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Dela Cruz"
                required
              />
            </label>
          </div>

          <label className="auth-field">
            <span>USERNAME</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.username"
              required
            />
          </label>

          <div className="auth-form-grid two">
            <label className="auth-field auth-password">
              <span>PASSWORD</span>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </label>

            <label className="auth-field">
              <span>CONFIRM PASSWORD</span>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                value={cpwd}
                onChange={(e) => setCpwd(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </label>
          </div>

          <label className="auth-field">
            <span>ROLE</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "guest")}
            >
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
          </label>

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <div className="auth-footer">
            <span>Already have CNFM credentials?</span>
            <button
              type="button"
              className="auth-secondary"
              onClick={onOpenLogin}
              aria-label="Back to sign in"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
