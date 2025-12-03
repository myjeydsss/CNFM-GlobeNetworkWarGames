import StatusLayout from "../StatusLayout";

export default function StatusMaintenance() {
  const handleOpenLogin = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cnfm-open-login"));
    }
  };

  return (
    <StatusLayout
      eyebrow="CNFM Network"
      title="Scheduled maintenance"
      message="We’re applying updates to keep the topology tools stable and secure. Please check back in a few minutes."
      hint="If this persists longer than expected, contact the ops team."
      imageSrc="/status/maintenance.svg"
      imageAlt="Maintenance mode"
      actions={
        <>
          <button className="status-button primary" onClick={handleOpenLogin}>
            Sign in
          </button>
          <button
            className="status-button"
            onClick={() => (window.location.href = "/")}
          >
            Back home
          </button>
        </>
      }
    />
  );
}
