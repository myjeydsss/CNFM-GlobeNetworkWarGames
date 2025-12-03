import StatusLayout from "../StatusLayout";

export default function StatusComingSoon() {
  const handleSignOut = () => {
    localStorage.clear();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  };

  return (
    <StatusLayout
      eyebrow="CNFM Network"
      title="Coming soon"
      message="Public access is not yet available. Use the admin console or sign in to continue."
      hint="If you already have credentials, sign back in to return to the dashboard."
      imageSrc="/status/coming-soon.svg"
      imageAlt="Coming soon"
      actions={
        <>
          <button className="status-button primary" onClick={handleSignOut}>
            Sign in again
          </button>
        </>
      }
    />
  );
}
