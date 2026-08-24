import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import ProjectsGrid from "@/components/ProjectsGrid";
import { listAboutEntries } from "@/lib/backend/featureStore";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Selected projects by Mukhtada Billah NST across web development, AI, data science, research, and community work, with stacks and source links.",
  path: "/projects",
});
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [session, { entries }] = await Promise.all([auth(), listAboutEntries()]);
  const fallbackCaption =
    "Selected work across web development, AI, and data science. Filter by type or category; all 57 repositories are available on GitHub.";
  const caption = entries.find((entry) => entry.entryKey === "projects-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label="// Quest Board" title="Projects">
        <EditablePageCaption
          entryKey="projects-caption"
          title="Projects caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>
      <ProjectsGrid />
    </div>
  );
}
