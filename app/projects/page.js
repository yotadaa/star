import { auth } from "@/auth";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import ProjectsGrid from "@/components/ProjectsGrid";
import { listAboutEntries } from "@/lib/backend/featureStore";

export const metadata = { title: "Projects - Mukhtada Billah NST" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [session, { entries }] = await Promise.all([auth(), listAboutEntries()]);
  const fallbackCaption =
    "Proyek pilihan lintas web, AI, dan data science. Saring berdasarkan tipe atau kategori - 57 repo selengkapnya ada di GitHub.";
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
