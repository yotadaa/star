import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import ContactCards from "@/components/ContactCards";
import EditablePageCaption from "@/components/EditablePageCaption";
import { listAboutEntries, listContactChannels } from "@/lib/backend/featureStore";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Mukhtada Billah NST through verified professional channels, source code, scientific publications, Blog, or social media.",
  path: "/contact",
});
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [session, { channels, source, warnings }, { entries }] = await Promise.all([
    auth(),
    listContactChannels(),
    listAboutEntries(),
  ]);
  const fallbackCaption = "Have a project, a research idea, or just want to say hello? Choose the channel that suits you.";
  const caption = entries.find((entry) => entry.entryKey === "contact-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label="// Open Comms" title="Let's connect">
        <EditablePageCaption
          entryKey="contact-caption"
          title="Contact caption"
          initialText={caption}
          canManage={canManage}
        />
      </PageHeader>
      {warnings?.length > 0 && <p className="backend-warning" role="status">Convex is not responding, so the factual local contact channels are being used as a fallback.</p>}
      <ContactCards channels={channels} source={source} />
    </div>
  );
}
