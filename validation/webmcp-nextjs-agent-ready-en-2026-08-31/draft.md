# WebMCP vs MCP: Making a Next.js Website Agent-Ready Without Screen Scraping

A browser agent can already operate a website by reading the DOM, locating a button, clicking it, waiting for the page to change, and trying again. Every step asks the model to reinterpret an interface built for a person.

WebMCP gives the page another option. The site can declare a named tool, describe its inputs with JSON Schema, connect it to the same application logic that serves the user interface, and return a bounded result. A tool named `filter_projects` makes the purpose of “AI” explicit instead of leaving the agent to infer it from a badge, link, or control.

That improvement has a strict boundary. [WebMCP is a proposed standard and remains experimental](https://developer.chrome.com/docs/ai/webmcp). Chrome exposes it through a Chrome 149 origin trial or a local development flag. A website that adds WebMCP still needs semantic HTML, accessible controls, stable URLs, and ordinary browser behavior.

![A laptop portfolio interface is connected by thread to five physical index tabs labeled Search, Filter, Project, Research, and Contact, beside a read-only stamp.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready:feature-tool-index)

*WebMCP adds a machine-readable route into existing product logic; it does not replace the human-facing interface.*

## WebMCP and MCP solve different discovery problems

MCP usually connects an agent client to a separately configured server. That server can expose tools and resources without the agent first opening a particular web page. It is useful for durable integrations with repositories, databases, local tools, and remote services.

WebMCP attaches tools to the active document. The current [Community Group draft defines `document.modelContext.registerTool()`](https://webmachinelearning.github.io/webmcp/) for JavaScript tools and also describes declarative tools for HTML forms. A browser agent discovers those tools after it visits the page. The page state, visible interface, and tool implementation can therefore share one lifecycle.

| Question | WebMCP | MCP |
|---|---|---|
| Where do tools live? | In the active web document | In a configured local or remote server |
| How are tools discovered? | The client visits the site | The client connects to the MCP server |
| Natural state boundary | Current page and browser session | Server resources and integration scope |
| Typical strength | Reliable use of a human-facing web app | Reusable access beyond one page |
| Main constraint | Experimental browser support and visit-first discovery | Installation, credentials, transport, and server permissions |

The name can be misleading. The WebMCP specification says browsers may expose page tools to their agents through MCP, proprietary function calling, or another mechanism. It does not require every browser-agent connection to use the MCP wire protocol.

## A five-tool surface for a Next.js portfolio

The portfolio at `me.mukhtada.my.id` now declares five small tools. Four are global read-only lookups. One exists only while the Projects page and its visible grid are mounted.

![Diagram of five WebMCP tools: four read-only public lookups and one reversible project filter.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready:evidence-tool-surface)

*The tool boundary excludes drafts, message sending, automatic navigation, and cross-origin exposure.*

| Tool | Input | Output or visible effect |
|---|---|---|
| `search_blog` | optional keyword and category | up to five published summaries |
| `get_project` | exact project title | one public project and its verified URL |
| `find_research` | exact paper title | one publication and a proposed URL |
| `get_contact_channels` | none | verified public channels; no message sent |
| `filter_projects` | type and category enums | the actual visible grid changes and returns its card count |

This surface deliberately omits `send_contact_message`. The site has public contact channels, not a message composer with a confirmation step. Giving an agent a tool name that implies delivery would promise behavior the product does not have. `get_contact_channels` returns the options and states `messageSent: false`.

Navigation is similarly restrained. Research and project tools return repository-owned URLs with `navigationPerformed: false`. The browser client or user can decide whether to open them. Caller-supplied URLs are never accepted.

## Progressive enhancement in the root client layer

The global tools mount inside the existing client provider. A small hook checks for `document.modelContext?.registerTool`. If the API is absent, it renders nothing, logs no production error, and leaves the website unchanged.

Each registration receives an `AbortController`. Unmounting the component, moving to a private route, or replaying an effect in React Strict Mode aborts that registration. The execute function stays in a ref, so ordinary React renders do not accumulate duplicate tool names.

```js
useEffect(() => {
  if (!enabled || !document.modelContext?.registerTool) return;

  const controller = new AbortController();
  document.modelContext.registerTool(
    { ...definition, execute: (input, options) => run(input, options.signal) },
    { signal: controller.signal },
  );

  return () => controller.abort();
}, [definition, enabled]);
```

The exact code also converts every result to plain JSON text, returns stable errors, and enforces a 1,500-character ceiling. That keeps a search result from flooding the agent context.

## The Blog search route cannot inherit owner access

The existing Blog API is session-aware. An authenticated owner can request drafts. Reusing that endpoint inside WebMCP would create a subtle leak: the same browser that manages the site could expose unpublished titles or excerpts to an agent.

A dedicated `/api/webmcp/blog-search` route fixes the boundary on the server. It always requests published data, rejects unknown parameters such as `includeDrafts`, whitelists output fields, strips bodies and internal IDs, returns no more than five rows, and sends `Cache-Control: no-store`.

An anonymous request and a request carrying a cookie produced the same response bytes for the same query. A request containing `includeDrafts=true` returned HTTP 400. That behavior matters more than asking every caller to remember `credentials: "omit"`; the endpoint itself is incapable of opting into draft semantics.

Blog excerpts remain untrusted content. The tool definition uses `untrustedContentHint`, and the response is serialized as plain data rather than HTML. [Chrome’s WebMCP security guidance](https://developer.chrome.com/docs/ai/webmcp/secure-tools) recommends that hint for user-generated or externally sourced material, alongside `readOnlyHint` for non-mutating tools.

## One selector controls both the grid and the tool

`filter_projects` is registered inside `ProjectsGrid`, not in the global provider. That placement gives the tool the same React setters and the same project list used by the visible controls. Leaving `/projects` removes the tool automatically.

Both manual button clicks and tool calls use one pure selector:

```js
export function selectProjects(projects, filters) {
  return projects.filter((project) =>
    (filters.type === "All" || project.type === filters.type) &&
    (filters.category === "All" || project.category === filters.category)
  );
}
```

The tool accepts enums rather than free text. An invalid pair changes neither filter. A valid pair is committed synchronously before the handler returns, so the returned `visibleCount` describes the grid already on screen.

![The live portfolio Projects page filtered to AI and All categories, showing two matching project cards.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready:evidence-live-filter)

*The same selector produced the two visible AI project cards on desktop and mobile without horizontal overflow.*

## What the compatibility checks prove

The implementation has five unique tool definitions. Every schema rejects additional properties; tool names and parameter names stay under Chrome’s recommended 30-character budget; descriptions stay below 500 characters; and encoded outputs are capped at 1,500 characters.

A mock model-context test registered a tool, invoked it, parsed its bounded JSON result, and confirmed that aborting the lifecycle signal removed it. The published-only endpoint held the same response across anonymous and cookie-bearing requests. The normal browser smoke test ran with `document.modelContext` undefined and rendered the Projects page without a WebMCP-specific warning or console error.

Native agent selection requires a Chrome 149 origin-trial client with the WebMCP API enabled. Until that client is part of the test surface, no percentage should be attached to `search_blog` selection, confirmation handling, or schema interpretation across agents. A complete native test covers discovery, direct invocation, ambiguous prompts, rapid state changes, and confirmation UI.

## Security choices that matter more than the demo

[Chrome describes prompt injection as an unresolved class of risk for agentic systems](https://developer.chrome.com/docs/ai/webmcp/secure-tools). A structured tool removes DOM-guessing steps, but its description and output still enter an agent’s context.

Five constraints keep this portfolio surface narrow:

1. **No cross-origin exposure.** The registration does not set `exposedTo`; the default same-origin policy remains in place.
2. **No private content.** Blog search uses a separate published-only endpoint and never falls back to the owner API.
3. **No irreversible actions.** The only mutation changes two visible filters and is immediately reversible.
4. **No caller-controlled destinations.** Project and research URLs come from the checked repository catalog.
5. **No silent contact action.** Contact tools list channels without opening a popup, invoking `mailto:`, recording analytics, or sending a message.

Future write tools need a separate design. Posting a comment, sending a form, copying private text, downloading a file, or changing account state cannot inherit the safety assumptions of a read-only lookup.

## Current limits and the challenge window

WebMCP clients must visit a website before they can discover its tools. That makes it different from a general integration directory. Chrome also says the API is primarily designed for local browser workflows with a human in the loop, and complex interfaces may require state refactoring.

The platform is moving quickly. The [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/) opened submissions on 25 August 2026 and closes on 3 September at 1 p.m. PT, which is 4 September at 03:00 WIB. OpenAI plans to announce winners on 23 September, while noting that the date may change with submission volume. Existing applications are eligible; the useful work is not limited to greenfield demos.

A durable Next.js implementation should therefore keep the experimental surface small. Tool registration belongs behind one hook. Business logic should stay in ordinary tested modules. Unsupported browsers should receive the full human website. If the proposal changes, removing the provider mount should disable WebMCP without dismantling the portfolio itself.

For broader agent infrastructure, [Open-Source Tools for 2026](/blog/open-source-tools-2026-stack-that-works-together) covers the surrounding toolchain, while [Why 100 Agent Skills Can Be Worse Than 5](/blog/why-100-agent-skills-can-be-worse-than-5) explains why a smaller tool catalog can be easier for an agent to route correctly.
