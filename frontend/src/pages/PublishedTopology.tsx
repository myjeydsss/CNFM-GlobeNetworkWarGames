import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminTopologyViewer from "./admin/AdminTopologyViewer";

export default function PublishedTopology() {
  const params = useParams<{ siteCode?: string }>();
  const navigate = useNavigate();
  const initial = params.siteCode ? params.siteCode.toUpperCase() : undefined;

  useEffect(() => {
    // ensure URL stays lowercase for consistency
    if (params.siteCode && params.siteCode !== params.siteCode.toLowerCase()) {
      navigate(`/topology/${params.siteCode.toLowerCase()}`, { replace: true });
    }
  }, [params.siteCode, navigate]);

  return (
    <AdminTopologyViewer
      key={initial || "__ALL__"}
      mode="public"
      initialSiteCode={initial}
      onSiteChange={(code) => {
        const next = code.toLowerCase();
        const current = params.siteCode || "";
        if (current !== next) {
          navigate(`/topology/${next}`, {
            replace: params.siteCode === undefined,
          });
        }
      }}
    />
  );
}
