export const PROJECT_TYPES = Object.freeze(["All", "Web", "AI", "Data"]);
export const PROJECT_CATEGORIES = Object.freeze(["All", "Personal", "Research", "Community"]);

export function normalizeProjectFilters(input = {}) {
  const type = String(input.type || "");
  const category = String(input.category || "");
  if (!PROJECT_TYPES.includes(type) || !PROJECT_CATEGORIES.includes(category)) return null;
  return { type, category };
}

export function selectProjects(projects, filters) {
  const normalized = normalizeProjectFilters(filters);
  if (!normalized) return [];
  return projects.filter((project) => (
    (normalized.type === "All" || project.type === normalized.type)
    && (normalized.category === "All" || project.category === normalized.category)
  ));
}
