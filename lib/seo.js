import { profile } from "@/lib/data";

const DEFAULT_SITE_URL = "https://me.mukhtada.my.id";

function normalizedSiteUrl(value) {
  try {
    const url = new URL(String(value || DEFAULT_SITE_URL).trim());
    if (!/^https?:$/.test(url.protocol)) return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalizedSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const SITE_NAME = "Mukhtada Billah NST";
export const DEFAULT_TITLE = "Mukhtada Billah NST — Fullstack, AI & Data";
export const DEFAULT_DESCRIPTION =
  "Portofolio Mukhtada Billah NST, mahasiswa Sistem Informasi Universitas Jambi yang membangun produk fullstack, AI tooling, dan riset data.";
const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Mukhtada Billah NST — Fullstack, AI, and data research portfolio",
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function pageMetadata({ title, description, path, type = "website" }) {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const socialTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      locale: "id_ID",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE.url],
    },
  };
}

export function siteStructuredData() {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "id-ID",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile-page`,
        url: absoluteUrl("/"),
        name: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "id-ID",
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        alternateName: profile.handle,
        url: absoluteUrl("/"),
        image: profile.avatar,
        jobTitle: profile.role,
        description: profile.lede_id,
        affiliation: {
          "@type": "CollegeOrUniversity",
          name: "Universitas Jambi",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jambi",
          addressCountry: "ID",
        },
        sameAs: Object.values(profile.links),
        knowsAbout: [
          "Fullstack web development",
          "AI tooling",
          "Data science",
          "Scientific research",
        ],
      },
    ],
  };
}
