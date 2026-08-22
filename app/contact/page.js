import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import ContactCards from "@/components/ContactCards";
import EditablePageCaption from "@/components/EditablePageCaption";
import { listAboutEntries, listContactChannels } from "@/lib/backend/featureStore";

export const metadata = { title: "Contact - Mukhtada Billah NST" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [session, { channels, source, warnings }, { entries }] = await Promise.all([
    auth(),
    listContactChannels(),
    listAboutEntries(),
  ]);
  const fallbackCaption = "Punya proyek, riset, atau sekadar mau menyapa? Pilih kanal yang paling nyaman buatmu.";
  const caption = entries.find((entry) => entry.entryKey === "contact-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label="// Open Comms" title="Ayo terhubung">
        <EditablePageCaption
          entryKey="contact-caption"
          title="Contact caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>
      {warnings?.length > 0 && <p className="backend-warning" role="status">Convex belum merespons, kanal lokal faktual tetap dipakai sebagai cadangan baca.</p>}
      <ContactCards channels={channels} source={source} />
    </div>
  );
}
