import PageHeader from "@/components/PageHeader";
import ContactCards from "@/components/ContactCards";
import { listContactChannels } from "@/lib/backend/featureStore";

export const metadata = { title: "Contact - Mukhtada Billah NST" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { channels, source, warnings } = await listContactChannels();

  return (
    <div className="page-wrap">
      <PageHeader label="// Open Comms" title="Ayo terhubung">
        Punya proyek, riset, atau sekadar mau menyapa? Pilih kanal yang paling nyaman buatmu.
      </PageHeader>
      {warnings?.length > 0 && <p className="backend-warning" role="status">Sebagian shard Contact belum merespons, kanal lokal faktual tetap dipakai sebagai cadangan baca.</p>}
      <ContactCards channels={channels} source={source} />
    </div>
  );
}
