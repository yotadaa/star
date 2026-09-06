import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import ScenicHero from "@/components/scenic-hero/ScenicHero";
import { projectsScene } from "@/components/scenic-hero/scenes/projects";
import scenicStyles from "@/components/scenic-hero/scenic-hero.module.css";
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
    <>
      <ScenicHero scene={projectsScene} title={publicPageCopy.projects.title} contentId="projects-content" cta="Explore projects">
        <EditablePageCaption
          entryKey="projects-caption"
          title="Projects caption"
          initialText={caption}
          canManage={canManage}
        />
      </ScenicHero>
      <div id="projects-content" className={`page-wrap ${scenicStyles.content}`}>
        <ProjectsGrid />
      </div>
    </>
  );
}
