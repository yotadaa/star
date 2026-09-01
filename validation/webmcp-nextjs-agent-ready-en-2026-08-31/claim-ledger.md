# Claim ledger

| Claim | Evidence | Boundary |
|---|---|---|
| WebMCP lets a website expose tools through JavaScript or HTML annotations | Chrome docs and W3C Community Group draft | Proposal remains experimental |
| Chrome 149 offers an origin trial / developer flag context | Chrome origin-trial page | Availability can change |
| WebMCP and MCP solve different discovery/deployment problems | W3C draft plus MCP architecture | They can coexist; no replacement claim |
| Tools are discovered after the client visits the website | Chrome docs | Not a global tool registry |
| Sensitive actions should preserve user visibility and confirmation | Chrome security guidance | Application policy must still enforce auth and authorization |
| The portfolio registers five tools when `document.modelContext` is available | New WebMCP implementation and static verifier | Current local browser lacks the experimental API |
| Published-blog search excludes drafts and bodies | `/api/webmcp/blog-search` contract and anonymous/cookie-equivalence check | It does not prove every future endpoint follows the same rule |
| Project filtering reuses the visible UI selector | `ProjectsGrid.jsx` and desktop/mobile smoke | Native agent selection was not measured |
