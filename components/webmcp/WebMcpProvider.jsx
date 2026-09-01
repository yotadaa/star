"use client";

import useWebMcpTool from "./useWebMcpTool";
import { featuredQuests, publications, socials } from "@/lib/data";
import { isPublicPortfolioPath } from "@/lib/publicRoutes.mjs";
import { createStaticPortfolioHandlers, WEBMCP_TOOL_DEFINITIONS } from "@/lib/webmcp/toolCatalog.mjs";

const staticHandlers = createStaticPortfolioHandlers({
  projects: featuredQuests,
  publications,
  contactChannels: socials,
});

async function searchPublishedBlog(input = {}, signal) {
  const params = new URLSearchParams();
  if (input.q) params.set("q", String(input.q).slice(0, 120));
  if (input.category) params.set("category", String(input.category).slice(0, 60));
  const timeoutSignal = AbortSignal.timeout(8000);
  const requestSignal = signal && typeof AbortSignal.any === "function"
    ? AbortSignal.any([signal, timeoutSignal])
    : signal || timeoutSignal;
  const response = await fetch(`/api/webmcp/blog-search?${params}`, {
    credentials: "omit",
    cache: "no-store",
    signal: requestSignal,
  });
  if (!response.ok) throw new Error("BLOG_SEARCH_UNAVAILABLE");
  const result = await response.json();
  if (!result?.ok || !Array.isArray(result.results)) throw new Error("BLOG_SEARCH_INVALID");
  return { results: result.results };
}

export default function WebMcpProvider({ pathname }) {
  const enabled = isPublicPortfolioPath(pathname);
  useWebMcpTool({ definition: WEBMCP_TOOL_DEFINITIONS.searchBlog, execute: searchPublishedBlog, enabled });
  useWebMcpTool({ definition: WEBMCP_TOOL_DEFINITIONS.getProject, execute: staticHandlers.getProject, enabled });
  useWebMcpTool({ definition: WEBMCP_TOOL_DEFINITIONS.findResearch, execute: staticHandlers.findResearch, enabled });
  useWebMcpTool({ definition: WEBMCP_TOOL_DEFINITIONS.getContactChannels, execute: staticHandlers.getContactChannels, enabled });
  return null;
}
