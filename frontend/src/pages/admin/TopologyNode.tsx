import { memo } from "react";
import { Handle, Position, NodeResizer, type NodeProps } from "reactflow";
import type { CSSProperties } from "react";

export type TopologyNodeData = {
  label: string;
  kind?: string;
  style?: CSSProperties;
  // Optional custom handle positions per side
  // You can pass arrays or object with { source, target }
  // Example:
  // handles: { top: { source: [35, 65], target: [20, 80] }, right: [25, 75] }
  handles?: {
    top?: number[] | { source?: number[]; target?: number[] };
    bottom?: number[] | { source?: number[]; target?: number[] };
    left?: number[] | { source?: number[]; target?: number[] };
    right?: number[] | { source?: number[]; target?: number[] };
  };
};

function TopologyNode({ data, selected, isConnectable }: NodeProps<TopologyNodeData>) {
  const label = data.label || "";
  const style = data.style as CSSProperties | undefined;
  const handles = data.handles || {};

  function sidePositions(side: "top" | "bottom" | "left" | "right") {
    const conf = (handles as any)[side];
    if (Array.isArray(conf)) {
      // One visible dot per side: put both a source and a target at same offset(s)
      return { source: conf as number[], target: conf as number[] };
    }
    // Defaults: a single dot per side at 50%
    const src = Array.isArray(conf?.source) && conf.source.length ? conf.source : [50];
    const tgt = Array.isArray(conf?.target) && conf.target.length ? conf.target : [50];
    return { source: src as number[], target: tgt as number[] };
  }

  const topPos = sidePositions("top");
  const bottomPos = sidePositions("bottom");
  const leftPos = sidePositions("left");
  const rightPos = sidePositions("right");
  return (
    <div
      className={`topology-node ${data.kind ?? "node"} ${selected ? "selected" : ""}`}
      style={style}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={140}
        minHeight={60}
        lineClassName="resize-line"
        handleClassName="resize-handle"
        color="#2563eb"
      />
      <span className="topology-node-label">{label}</span>
      {/* Top side: one visual dot (target below, source above) */}
      {topPos.target.map((pct, idx) => (
        <Handle
          key={`t-top-${idx + 1}`}
          type="target"
          position={Position.Top}
          className="topology-handle target"
          id={`t-top-${idx + 1}`}
          style={{ left: `${pct}%`, transform: "translate(-50%, 0)", zIndex: 9 }}
          isConnectable={isConnectable}
        />
      ))}
      {topPos.source.map((pct, idx) => (
        <Handle
          key={`s-top-${idx + 1}`}
          type="source"
          position={Position.Top}
          className="topology-handle source"
          id={`s-top-${idx + 1}`}
          style={{ left: `${pct}%`, transform: "translate(-50%, 0)", zIndex: 10 }}
          isConnectable={isConnectable}
        />
      ))}

      {/* Bottom side: target below, source above at same spot */}
      {bottomPos.target.map((pct, idx) => (
        <Handle
          key={`t-bottom-${idx + 1}`}
          type="target"
          position={Position.Bottom}
          className="topology-handle target"
          id={`t-bottom-${idx + 1}`}
          style={{
            left: `${pct}%`,
            bottom: -2,
            transform: "translate(-50%, 30%)",
            zIndex: 9,
          }}
          isConnectable={isConnectable}
        />
      ))}
      {bottomPos.source.map((pct, idx) => (
        <Handle
          key={`s-bottom-${idx + 1}`}
          type="source"
          position={Position.Bottom}
          className="topology-handle source"
          id={`s-bottom-${idx + 1}`}
          style={{
            left: `${pct}%`,
            bottom: -2,
            transform: "translate(-50%, 30%)",
            zIndex: 10,
          }}
          isConnectable={isConnectable}
        />
      ))}

      {/* Left side: target below, source above */}
      {leftPos.target.map((pct, idx) => (
        <Handle
          key={`t-left-${idx + 1}`}
          type="target"
          position={Position.Left}
          className="topology-handle target"
          id={`t-left-${idx + 1}`}
          style={{ top: `${pct}%`, transform: "translate(0, -50%)", zIndex: 9 }}
          isConnectable={isConnectable}
        />
      ))}
      {leftPos.source.map((pct, idx) => (
        <Handle
          key={`s-left-${idx + 1}`}
          type="source"
          position={Position.Left}
          className="topology-handle source"
          id={`s-left-${idx + 1}`}
          style={{ top: `${pct}%`, transform: "translate(0, -50%)", zIndex: 10 }}
          isConnectable={isConnectable}
        />
      ))}

      {/* Right side: target below, source above */}
      {rightPos.target.map((pct, idx) => (
        <Handle
          key={`t-right-${idx + 1}`}
          type="target"
          position={Position.Right}
          className="topology-handle target"
          id={`t-right-${idx + 1}`}
          style={{ top: `${pct}%`, transform: "translate(0, -50%)", zIndex: 9 }}
          isConnectable={isConnectable}
        />
      ))}
      {rightPos.source.map((pct, idx) => (
        <Handle
          key={`s-right-${idx + 1}`}
          type="source"
          position={Position.Right}
          className="topology-handle source"
          id={`s-right-${idx + 1}`}
          style={{ top: `${pct}%`, transform: "translate(0, -50%)", zIndex: 10 }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
}

export default memo(TopologyNode);
