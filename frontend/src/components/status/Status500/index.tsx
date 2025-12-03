import StatusLayout from "../StatusLayout";

export default function Status500() {
  const handleOpenLogin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  };

  return (
    <StatusLayout
      eyebrow="Server issue"
      title="Something went wrong"
      message="The server hit an unexpected error. Try refreshing or head back to a safe page while we investigate."
      imageSrc="/status/500.svg"
      imageAlt="Server error"
      actions={
        <>
          <button className="status-button primary" onClick={() => window.location.reload()}>
            Refresh
          </button>
          <button className="status-button" onClick={() => (window.location.href = "/")}>
            Go home
          </button>
          <button className="status-button" onClick={handleOpenLogin}>
            Sign in
          </button>
        </>
      }
    />
  );
}
