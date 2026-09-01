import assert from "node:assert/strict";
import { selectProjects, normalizeProjectFilters } from "../../lib/projects/projectFilters.mjs";
import { registerWebMcpTool } from "../../lib/webmcp/registerTool.mjs";
import { WEBMCP_RESULT_LIMIT } from "../../lib/webmcp/result.mjs";
import { createStaticPortfolioHandlers, WEBMCP_TOOL_DEFINITIONS } from "../../lib/webmcp/toolCatalog.mjs";

const definitions = Object.values(WEBMCP_TOOL_DEFINITIONS);
assert.equal(new Set(definitions.map((definition) => definition.name)).size, definitions.length);
for (const definition of definitions) {
  assert.ok(definition.name.length <= 30, `${definition.name} is too long`);
  assert.ok(definition.description.length <= 500, `${definition.name} description is too long`);
  assert.equal(definition.inputSchema.additionalProperties, false);
  for (const parameter of Object.keys(definition.inputSchema.properties)) {
    assert.ok(parameter.length <= 30, `${definition.name}.${parameter} is too long`);
  }
}

const registered = new Map();
const fakeModelContext = {
  async registerTool(tool, { signal }) {
    assert.ok(!registered.has(tool.name), `duplicate ${tool.name}`);
    registered.set(tool.name, tool);
    signal.addEventListener("abort", () => registered.delete(tool.name), { once: true });
  },
};
const lifecycleController = new AbortController();
await registerWebMcpTool(
  fakeModelContext,
  WEBMCP_TOOL_DEFINITIONS.getProject,
  async (input, signal) => {
    if (input.waitForAbort) {
      await new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    }
    return { value: "ok" };
  },
  lifecycleController.signal,
);
assert.equal(registered.size, 1);
const invocationController = new AbortController();
const encoded = await registered.get("get_project").execute(
  { title: "Example" },
  { signal: invocationController.signal },
);
assert.ok(encoded.length <= WEBMCP_RESULT_LIMIT);
assert.deepEqual(JSON.parse(encoded), { ok: true, value: "ok" });
const pending = registered.get("get_project").execute(
  { waitForAbort: true },
  { signal: invocationController.signal },
);
lifecycleController.abort(new DOMException("route unmounted", "AbortError"));
assert.equal(JSON.parse(await pending).error, "ABORTED");
assert.equal(invocationController.signal.aborted, false);
assert.equal(registered.size, 0);

const projects = [
  { title: "Alpha", desc: "A", type: "Web", category: "Personal", tags: ["Next.js"], href: "https://example.com/a" },
  { title: "Beta", desc: "B", type: "AI", category: "Research", tags: ["Python"], href: "https://example.com/b" },
];
const publications = [{ title: "Paper A", authors: "A", venue: "V", year: "2026", href: "https://example.com/p" }];
const channels = [{ key: "github", label: "GitHub", href: "https://github.com/example" }];
const handlers = createStaticPortfolioHandlers({ projects, publications, contactChannels: channels });
assert.equal(handlers.getProject({ title: " alpha " }).project.title, "Alpha");
assert.equal(handlers.findResearch({ title: "paper a" }).navigationPerformed, false);
assert.equal(handlers.getContactChannels({}).messageSent, false);
assert.deepEqual(normalizeProjectFilters({ type: "Web", category: "Personal" }), { type: "Web", category: "Personal" });
assert.equal(normalizeProjectFilters({ type: "Unknown", category: "Personal" }), null);
assert.equal(selectProjects(projects, { type: "All", category: "Research" }).length, 1);

console.log(JSON.stringify({
  definitions: definitions.length,
  lifecycleCleanup: true,
  outputLimit: WEBMCP_RESULT_LIMIT,
  staticHandlers: true,
  projectSelector: true,
}, null, 2));
