import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { login, saveAuth } from "../../services/auth";
import "./LoginModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function LoginModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset & focus
  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    } else {
      setUsername("");
      setPwd("");
      setErr(null);
      setLoading(false);
      setShowPwd(false);
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

    if (username.trim().length < 3)
      return setErr("Username must be at least 3 characters long.");
    if (!pwd) return setErr("Password is required.");

    try {
      setLoading(true);
      const res = await login(username.trim(), pwd);
      saveAuth(res.token, res.user);

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });

      Toast.fire({
        icon: "success",
        title: `Signed in successfully`,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error?.message || "Invalid username or password.",
        confirmButtonColor: "#2563eb",
        background: "#0b1220",
        color: "#e2e8f0",
      });
      setErr(error?.message || "Login failed. Please try again.");
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
      aria-labelledby="login-title"
      id="login-modal"
    >
      <div className="auth-card" role="document">
        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close sign in dialog"
        >
          ×
        </button>

        <form
          className="auth-pane auth-pane--form auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="auth-heading">
            <h3 id="login-title">Sign in to continue</h3>
            <p>Use your network credentials to enter the admin dashboard.</p>
          </div>

          {err && (
            <div className="auth-alert" role="alert">
              {err}
            </div>
          )}

          <label className="floating-input login-input">
            <span>Username</span>
            <input
              ref={firstFieldRef}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="floating-input login-input with-toggle">
            <span>Password</span>
            <input
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="visibility-toggle"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </label>

          <div className="auth-links">
            <button
              type="button"
              onClick={() => {
                /* hook up when ready */
              }}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

        </form>
      </div>
    </div>,
    document.body
  );
}
