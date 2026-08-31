import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import ProjectsGrid from "@/components/ProjectsGrid";
import { listAboutEntries } from "@/lib/backend/featureStore";
import { publicPageCopy } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.projects.metadataTitle,
  description: publicPageCopy.projects.metadataDescription,
  path: "/projects",
  tags: publicPageCopy.projects.keywords,
});
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [session, { entries }] = await Promise.all([auth(), listAboutEntries()]);
  const fallbackCaption = publicPageCopy.projects.caption;
  const caption = entries.find((entry) => entry.entryKey === "projects-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label={publicPageCopy.projects.label} title={publicPageCopy.projects.title}>
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
