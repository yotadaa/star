import PageHeader from "@/components/PageHeader";
import ProjectsGrid from "@/components/ProjectsGrid";

export const metadata = { title: "Projects - Mukhtada Billah NST" };

export default function ProjectsPage() {
  return (
    <div className="page-wrap">
      <PageHeader label="// Quest Board" title="Projects">
        Proyek pilihan lintas web, AI, dan data science. Saring berdasarkan tipe atau kategori - 57 repo
        selengkapnya ada di GitHub.
      </PageHeader>
      <ProjectsGrid />
    </div>
  );
}
