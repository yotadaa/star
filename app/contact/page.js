import { auth } from "@/auth";
import PageHeader from "@/components/PageHeader";
import ContactCards from "@/components/ContactCards";
import EditablePageCaption from "@/components/EditablePageCaption";
import { listAboutEntries, listContactChannels } from "@/lib/backend/featureStore";
import { publicPageCopy } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.contact.metadataTitle,
  description: publicPageCopy.contact.metadataDescription,
  path: "/contact",
  tags: publicPageCopy.contact.keywords,
  titleSuffix: "",
  absoluteTitle: true,
});
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [session, { channels, source, warnings }, { entries }] = await Promise.all([
    auth(),
    listContactChannels(),
    listAboutEntries(),
  ]);
  const fallbackCaption = publicPageCopy.contact.caption;
  const caption = entries.find((entry) => entry.entryKey === "contact-caption")?.body || fallbackCaption;
  const canManage = session?.user?.role === "owner";

  return (
    <div className="page-wrap">
      <PageHeader label={publicPageCopy.contact.label} title={publicPageCopy.contact.title}>
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
