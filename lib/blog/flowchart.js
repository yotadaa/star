const HEADER_PATTERN = /^(?:flowchart|graph)\s+(LR|RL|TD|TB|BT)\s*$/i;
const EDGE_PATTERN = /^(.+?)\s*(<-->|-->|---|-\.->|==>)\s*(.+?)\s*$/;
const NODE_PATTERN = /^([A-Za-z][\w-]*)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?$/;
const MAX_SOURCE_LENGTH = 20_000;
const MAX_LINES = 120;
const MAX_NODES = 80;
const MAX_EDGES = 120;
const MAX_LABEL_LENGTH = 120;

function parseNode(source) {
  const match = String(source || "").trim().match(NODE_PATTERN);
  if (!match) return null;
  const label = match[2] || match[3] || match[4] || match[1];
  if (label.length > MAX_LABEL_LENGTH || /[<>]/.test(label)) return null;
  return {
    id: match[1],
    label,
    shape: match[4] ? "decision" : match[3] ? "round" : "rect",
  };
}

function splitLabel(label, limit = 22) {
  const words = String(label || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let line = "";

  for (const word of words) {
    if (!line || `${line} ${word}`.length <= limit) {
      line = line ? `${line} ${word}` : word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

export function parseBlogFlowchart(source) {
  const input = String(source || "");
  if (input.length > MAX_SOURCE_LENGTH) return { ok: false, reason: "The flowchart exceeds the source limit." };
  const lines = input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("%%"));
  if (lines.length > MAX_LINES) return { ok: false, reason: "The flowchart has too many lines." };
  const header = lines.shift()?.match(HEADER_PATTERN);
  if (!header) return { ok: false, reason: "The flowchart header is not recognized." };

  const direction = header[1].toUpperCase();
  const nodeMap = new Map();
  const edges = [];

  const register = (node) => {
    const existing = nodeMap.get(node.id);
    if (!existing || existing.label === existing.id) nodeMap.set(node.id, node);
  };

  for (const line of lines) {
    const edge = line.match(EDGE_PATTERN);
    if (!edge) return { ok: false, reason: `Unsupported syntax: ${line}` };
    const from = parseNode(edge[1]);
    const to = parseNode(edge[3]);
    if (!from || !to) return { ok: false, reason: `Unsupported node: ${line}` };
    register(from);
    register(to);
    edges.push({ from: from.id, to: to.id, type: edge[2] });
    if (nodeMap.size > MAX_NODES || edges.length > MAX_EDGES) {
      return { ok: false, reason: "The flowchart exceeds the node or connection limit." };
    }
  }

  if (!edges.length || !nodeMap.size) return { ok: false, reason: "The flowchart has no renderable connections." };

  const nodes = [...nodeMap.values()];
  const ranks = new Map(nodes.map((node) => [node.id, 0]));
  const directed = edges.filter((edge) => edge.type !== "<-->" && edge.type !== "---");
  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false;
    for (const edge of directed) {
      const nextRank = Math.min(nodes.length - 1, (ranks.get(edge.from) || 0) + 1);
      if (nextRank > (ranks.get(edge.to) || 0)) {
        ranks.set(edge.to, nextRank);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const groups = new Map();
  for (const node of nodes) {
    const rank = ranks.get(node.id) || 0;
    if (!groups.has(rank)) groups.set(rank, []);
    groups.get(rank).push(node);
  }

  const sortedRanks = [...groups.keys()].sort((a, b) => a - b);
  const rankIndex = new Map(sortedRanks.map((rank, index) => [rank, index]));
  const horizontal = direction === "LR" || direction === "RL";
  const maxLane = Math.max(...[...groups.values()].map((group) => group.length));
  const rankCount = sortedRanks.length;
  const width = horizontal ? Math.max(560, rankCount * 222 + 52) : Math.max(560, maxLane * 210 + 52);
  const height = horizontal ? Math.max(260, maxLane * 102 + 72) : Math.max(300, rankCount * 116 + 60);
  const positions = new Map();

  for (const [rank, group] of groups.entries()) {
    const rawRankIndex = rankIndex.get(rank);
    const visualRank = direction === "RL" || direction === "BT" ? rankCount - rawRankIndex - 1 : rawRankIndex;
    group.forEach((node, lane) => {
      const centeredLane = lane + (maxLane - group.length) / 2;
      positions.set(node.id, horizontal
        ? { x: 116 + visualRank * 222, y: 60 + centeredLane * 102 }
        : { x: 116 + centeredLane * 210, y: 64 + visualRank * 116 });
    });
  }

  return {
    ok: true,
    direction,
    width,
    height,
    nodes: nodes.map((node) => ({ ...node, lines: splitLabel(node.label), ...positions.get(node.id) })),
    edges: edges.map((edge) => ({ ...edge, fromPosition: positions.get(edge.from), toPosition: positions.get(edge.to) })),
  };
}
