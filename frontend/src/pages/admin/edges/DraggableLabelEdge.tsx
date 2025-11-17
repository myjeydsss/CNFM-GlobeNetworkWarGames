import { useEffect, useMemo, useRef, useState } from "react";
import {
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from "reactflow";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

type EdgeShape = "smoothstep" | "straight" | "step" | "bezier";

type EdgeData = {
  shape?: EdgeShape;
  labelT?: number;
  labelOffset?: { x: number; y: number };
  onLabelPositionChange?: (id: string, payload: { t: number }) => void;
  readOnly?: boolean;
  onToggle?: (id: string) => void;
  structural?: boolean;
  isOffline?: boolean;
  isAlternative?: boolean;
  labelBg?: string;
  labelBorder?: string;
  labelColor?: string;
  labelTitle?: string;
  onHoverChange?: (payload: {
    id: string;
    type: "enter" | "move" | "leave";
    clientX: number;
    clientY: number;
  }) => void;
  interactionWidth?: number;
};

function buildPath(
  shape: EdgeShape,
  params: {
    sourceX: number;
    sourceY: number;
    sourcePosition: any;
    targetX: number;
    targetY: number;
    targetPosition: any;
  }
) {
  const { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition } =
    params;
  switch (shape) {
    case "straight":
      return getStraightPath({ sourceX, sourceY, targetX, targetY });
    case "step":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });
    case "bezier":
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
    case "smoothstep":
    default:
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
  }
}

export default function DraggableLabelEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    animated,
    selected,
    label,
    data,
  } = props as EdgeProps & { data?: EdgeData };

  const shape = (data?.shape ?? "smoothstep") as EdgeShape;
  const offsetX =
    typeof data?.labelOffset?.x === "number" &&
    Number.isFinite(data?.labelOffset?.x)
      ? data?.labelOffset?.x
      : 0;
  const offsetY =
    typeof data?.labelOffset?.y === "number" &&
    Number.isFinite(data?.labelOffset?.y)
      ? data?.labelOffset?.y
      : 0;
  const [edgePath] = useMemo(
    () =>
      buildPath(shape, {
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      }),
    [shape, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]
  );

  const pathRef = useRef<SVGPathElement | null>(null);
  const [labelXY, setLabelXY] = useState<{ x: number; y: number }>({
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  });
  const labelT = Math.min(1, Math.max(0, data?.labelT ?? 0.5));

  useEffect(() => {
    if (!pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    const pt = pathRef.current.getPointAtLength(total * labelT);
    setLabelXY({ x: pt.x + offsetX, y: pt.y + offsetY });
  }, [edgePath, labelT, offsetX, offsetY]);

  function clientToRF(clientX: number, clientY: number) {
    const path = pathRef.current;
    if (!path) return { x: clientX, y: clientY };
    const flow = path.closest(".react-flow") as HTMLElement | null;
    const viewport = flow?.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    const rect = flow?.getBoundingClientRect();
    const transform = viewport ? getComputedStyle(viewport).transform : "";
    let tx = 0,
      ty = 0,
      s = 1;
    if (transform && transform !== "none") {
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(",").map((v) => parseFloat(v.trim()));
        s = parts[0] || 1;
        tx = parts[4] || 0;
        ty = parts[5] || 0;
      }
    }
    const left = rect?.left || 0;
    const top = rect?.top || 0;
    return {
      x: (clientX - left - tx) / s,
      y: (clientY - top - ty) / s,
    };
  }

  function nearestPointOnPath(x: number, y: number) {
    const path = pathRef.current;
    if (!path) return { t: labelT, point: { x, y } };
    const total = path.getTotalLength();
    let bestLen = 0;
    let bestDist = Infinity;
    let bestPoint = { x, y };
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const l = (i / samples) * total;
      const p = path.getPointAtLength(l);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestLen = l;
        bestPoint = p;
      }
    }
    return { t: bestLen / total, point: bestPoint };
  }

  function startDrag(e: ReactMouseEvent) {
    if (data?.readOnly) return;
    e.stopPropagation();
    const move = (ev: MouseEvent) => {
      const rf = clientToRF(ev.clientX, ev.clientY);
      const { t, point } = nearestPointOnPath(rf.x, rf.y);
      setLabelXY({ x: point.x + offsetX, y: point.y + offsetY });
      data?.onLabelPositionChange?.(id, { t });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  const clickable = typeof data?.onToggle === "function" && !data?.structural;
  const interactionWidth = data?.interactionWidth ?? 56;
  const hitPathStyle: CSSProperties = {
    cursor: clickable
      ? "pointer"
      : (style as CSSProperties | undefined)?.cursor,
    pointerEvents: "stroke",
    stroke: "transparent",
    strokeWidth: interactionWidth,
    fill: "none",
  };
  const visualPathStyle: CSSProperties = {
    ...(style || {}),
    pointerEvents: "none",
  };
  const pathClasses = [
    "react-flow__edge-path",
    animated ? "animated" : "",
    data?.isOffline ? "edge-offline" : "",
    data?.isAlternative ? "edge-alternative" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const labelBg = data?.labelBg ?? "#facc15";
  const labelBorder = data?.labelBorder ?? "#b45309";
  const labelColor = data?.labelColor ?? "#1f2937";
  const labelCursor = clickable
    ? "pointer"
    : data?.readOnly
    ? "default"
    : "grab";
  const labelTitle =
    data?.labelTitle ??
    (clickable
      ? "Toggle route status"
      : data?.readOnly
      ? undefined
      : "Drag to reposition label");

  const emitHover =
    (type: "enter" | "move" | "leave") => (event: ReactMouseEvent) =>
      data?.onHoverChange?.({
        id,
        type,
        clientX: event.clientX,
        clientY: event.clientY,
      });

  const handleToggle = (event?: ReactMouseEvent) => {
    if (!clickable) return;
    event?.stopPropagation();
    data?.onToggle?.(id);
  };

  return (
    <>
      <path
        ref={pathRef}
        d={edgePath}
        className={pathClasses}
        stroke="transparent"
        strokeWidth={interactionWidth}
        fill="none"
        style={hitPathStyle}
        onClick={handleToggle}
        onMouseEnter={emitHover("enter")}
        onMouseLeave={emitHover("leave")}
      />
      <path
        d={edgePath}
        className={pathClasses}
        markerEnd={markerEnd}
        fill="none"
        style={visualPathStyle}
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            onMouseDown={data?.readOnly ? undefined : startDrag}
            onMouseEnter={emitHover("enter")}
            onMouseLeave={emitHover("leave")}
            onClick={handleToggle}
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelXY.x}px, ${labelXY.y}px)`,
              pointerEvents: "all",
              background: labelBg,
              color: labelColor,
              border: `1px solid ${labelBorder}`,
              borderRadius: 999,
              padding: "2px 5px",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: ".01em",
              userSelect: "none",
              boxShadow: selected ? "0 0 0 3px rgba(37,99,235,.2)" : undefined,
              cursor: labelCursor,
            }}
            title={labelTitle}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
