import StatusLayout from "../StatusLayout";

export default function Status401() {
  const handleOpenLogin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  };
  return (
    <StatusLayout
      eyebrow="Access denied"
      title="You’re not authorized"
      message="Your session doesn’t include access to this page. Sign in with an account that has the right permissions."
      imageSrc="/status/401.svg"
      imageAlt="Unauthorized"
      actions={
        <>
          <button className="status-button primary" onClick={handleOpenLogin}>
            Sign in
          </button>
          <button className="status-button" onClick={() => (window.location.href = "/")}>
            Go back
          </button>
        </>
      }
    />
  );
}
