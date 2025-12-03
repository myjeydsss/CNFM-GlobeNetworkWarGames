import StatusLayout from "../StatusLayout";

export default function Status404() {
  const handleOpenLogin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  };
  return (
    <StatusLayout
      eyebrow="Not found"
      title="We can’t find that page"
      message="The link may be outdated or you might not have permission to view it. Try returning to a known page."
      imageSrc="/status/404.svg"
      imageAlt="Not found"
      actions={
        <>
          <button className="status-button primary" onClick={handleOpenLogin}>
            Sign in
          </button>
          <button className="status-button" onClick={() => (window.location.href = "/")}>
            Go to dashboard
          </button>
        </>
      }
    />
  );
}
