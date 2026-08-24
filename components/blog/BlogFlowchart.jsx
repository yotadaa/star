import { parseBlogFlowchart } from "@/lib/blog/flowchart";

function edgePath(edge, horizontal) {
  const source = edge.fromPosition;
  const target = edge.toPosition;
  if (!source || !target) return "";

  if (horizontal) {
    const forward = target.x >= source.x;
    const x1 = source.x + (forward ? 88 : -88);
    const x2 = target.x + (forward ? -88 : 88);
    const middle = (x1 + x2) / 2;
    return `M ${x1} ${source.y} C ${middle} ${source.y}, ${middle} ${target.y}, ${x2} ${target.y}`;
  }

  const forward = target.y >= source.y;
  const y1 = source.y + (forward ? 34 : -34);
  const y2 = target.y + (forward ? -34 : 34);
  const middle = (y1 + y2) / 2;
  return `M ${source.x} ${y1} C ${source.x} ${middle}, ${target.x} ${middle}, ${target.x} ${y2}`;
}

function FlowNode({ node }) {
  const height = Math.max(58, node.lines.length * 17 + 24);
  return (
    <g className={`blog-flowchart-node is-${node.shape}`} transform={`translate(${node.x} ${node.y})`}>
      {node.shape === "decision" ? (
        <polygon points={`0,${-height / 2} 92,0 0,${height / 2} -92,0`} />
      ) : (
        <rect x="-88" y={-height / 2} width="176" height={height} rx={node.shape === "round" ? 28 : 2} />
      )}
      <text textAnchor="middle" dominantBaseline="middle">
        {node.lines.map((line, index) => (
          <tspan x="0" dy={index === 0 ? `${-(node.lines.length - 1) * 0.55}em` : "1.12em"} key={`${node.id}-${index}`}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
export default function BlogFlowchart({ source }) {
  const chart = parseBlogFlowchart(source);
  if (!chart.ok) {
    return (
      <figure className="blog-flowchart-fallback">
        <figcaption>The diagram could not be rendered: {chart.reason}</figcaption>
        <pre><code>{source}</code></pre>
      </figure>
    );
  }

  const horizontal = chart.direction === "LR" || chart.direction === "RL";
  const summary = chart.edges
    .map((edge) => `${edge.from} ${edge.type === "<-->" ? "connects both ways with" : "leads to"} ${edge.to}`)
    .join("; ");

  return (
    <figure className="blog-flowchart">
      <figcaption>
        <span>System map</span>
        <small>{chart.direction} · {chart.nodes.length} nodes · {chart.edges.length} connections</small>
      </figcaption>
      <div className="blog-flowchart-canvas">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label={`Flowchart direction ${chart.direction}. ${summary}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker id="blog-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <g className="blog-flowchart-edges">
            {chart.edges.map((edge, index) => (
              <path
                d={edgePath(edge, horizontal)}
                className={`is-${edge.type === "-.->" ? "dotted" : edge.type === "==>" ? "thick" : "standard"}`}
                markerStart={edge.type === "<-->" ? "url(#blog-flow-arrow)" : undefined}
                markerEnd={edge.type === "---" ? undefined : "url(#blog-flow-arrow)"}
                key={`${edge.from}-${edge.to}-${index}`}
              />
            ))}
          </g>
          <g className="blog-flowchart-nodes">
            {chart.nodes.map((node) => <FlowNode node={node} key={node.id} />)}
          </g>
        </svg>
      </div>
      <p className="sr-only">{summary}</p>
    </figure>
  );
}
