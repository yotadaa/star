"use client";

import { useMemo } from "react";
import { getPlayerProgress } from "@/lib/playerProgress";

export default function usePlayerProgress() {
  return useMemo(() => getPlayerProgress(), []);
}
