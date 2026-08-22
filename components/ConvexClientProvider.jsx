"use client";

import { useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export default function ConvexClientProvider({ children, deploymentUrl }) {
  const convex = useMemo(() => new ConvexReactClient(deploymentUrl), [deploymentUrl]);
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
