import PageHeader from "@/components/PageHeader";
import ContactCards from "@/components/ContactCards";

export const metadata = { title: "Contact - Mukhtada Billah NST" };

export default function ContactPage() {
  return (
    <div className="page-wrap">
      <PageHeader label="// Open Comms" title="Ayo terhubung">
        Punya proyek, riset, atau sekadar mau menyapa? Pilih kanal yang paling nyaman buatmu.
      </PageHeader>
      <ContactCards />
    </div>
  );
}
