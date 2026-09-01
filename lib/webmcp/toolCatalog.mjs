import { WebMcpToolError } from "./result.mjs";

const objectSchema = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

export const WEBMCP_TOOL_DEFINITIONS = Object.freeze({
  searchBlog: Object.freeze({
    name: "search_blog",
    title: "Search published blog posts",
    description: "Search public, published blog summaries by keyword or category. Drafts and article bodies are never returned.",
    inputSchema: objectSchema({
      q: { type: "string", maxLength: 120, description: "Optional title, excerpt, or tag keywords." },
      category: { type: "string", maxLength: 60, description: "Optional category or tag." },
    }),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  }),
  getProject: Object.freeze({
    name: "get_project",
    title: "Get one portfolio project",
    description: "Return one public portfolio project by its exact title. The returned URL is informational and is not opened.",
    inputSchema: objectSchema({
      title: { type: "string", minLength: 1, maxLength: 120, description: "Exact project title." },
    }, ["title"]),
    annotations: { readOnlyHint: true },
  }),
  findResearch: Object.freeze({
    name: "find_research",
    title: "Find one research paper",
    description: "Return one public research record by exact title and propose its verified URL without navigating.",
    inputSchema: objectSchema({
      title: { type: "string", minLength: 1, maxLength: 180, description: "Exact research title." },
    }, ["title"]),
    annotations: { readOnlyHint: true },
  }),
  getContactChannels: Object.freeze({
    name: "get_contact_channels",
    title: "Get public contact channels",
    description: "List verified public contact channels and the Contact page. It does not open a link or send a message.",
    inputSchema: objectSchema({}),
    annotations: { readOnlyHint: true },
  }),
  filterProjects: Object.freeze({
    name: "filter_projects",
    title: "Filter visible projects",
    description: "Set the visible project grid type and category filters, then return the number of cards now shown.",
    inputSchema: objectSchema({
      type: { type: "string", enum: ["All", "Web", "AI", "Data"], description: "Visible project type filter." },
      category: { type: "string", enum: ["All", "Personal", "Research", "Community"], description: "Visible project category filter." },
    }, ["type", "category"]),
    annotations: { readOnlyHint: false },
  }),
});

function normalized(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function exactRecord(records, title, label) {
  const wanted = normalized(title);
  if (!wanted) throw new WebMcpToolError("INVALID_INPUT", `${label} title is required.`);
  const matches = records.filter((record) => normalized(record.title) === wanted);
  if (matches.length === 0) throw new WebMcpToolError("NOT_FOUND", `${label} was not found.`);
  if (matches.length > 1) throw new WebMcpToolError("AMBIGUOUS", `${label} title matches more than one record.`);
  return matches[0];
}

export function createStaticPortfolioHandlers({ projects, publications, contactChannels }) {
  return {
    getProject(input) {
      const project = exactRecord(projects, input?.title, "Project");
      return {
        project: {
          title: project.title,
          description: project.desc,
          type: project.type,
          category: project.category,
          tags: project.tags,
          url: project.href,
        },
        navigationPerformed: false,
      };
    },
    findResearch(input) {
      const publication = exactRecord(publications, input?.title, "Research record");
      return {
        research: {
          title: publication.title,
          authors: publication.authors,
          venue: publication.venue,
          year: publication.year,
          url: publication.href,
        },
        navigationPerformed: false,
      };
    },
    getContactChannels() {
      return {
        contactPage: "/contact",
        channels: contactChannels.map((channel) => ({
          id: channel.key,
          label: channel.label,
          url: channel.href,
        })),
        navigationPerformed: false,
        messageSent: false,
      };
    },
  };
}
