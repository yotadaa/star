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
export const DEFAULT_LANGUAGE = "en-US";
export const DEFAULT_OG_LOCALE = "en_US";
export const DEFAULT_TITLE = "Mukhtada Billah NST — Fullstack, AI & Data";
export const DEFAULT_DESCRIPTION =
  "The portfolio of Mukhtada Billah NST, an Information Systems student at the University of Jambi building fullstack products, AI tooling, and data research.";
export const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Mukhtada Billah NST — Fullstack, AI, and data research portfolio",
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  images,
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  titleSuffix = SITE_NAME,
  absoluteTitle = false,
}) {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const socialTitle = titleSuffix ? `${title} · ${titleSuffix}` : title;
  const socialImages = Array.isArray(images) && images.length ? images : [DEFAULT_SOCIAL_IMAGE];
  const twitterImages = socialImages
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter(Boolean);
  const articleMetadata = type === "article"
    ? {
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        ...(authors?.length ? { authors } : {}),
        ...(section ? { section } : {}),
        ...(tags?.length ? { tags } : {}),
      }
    : {};

  return {
    title: absoluteTitle ? { absolute: socialTitle } : title,
    description,
    ...(tags?.length ? { keywords: tags } : {}),
    alternates: { canonical },
    openGraph: {
      type,
      locale: DEFAULT_OG_LOCALE,
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: socialImages,
      ...articleMetadata,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: twitterImages,
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
        inLanguage: DEFAULT_LANGUAGE,
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile-page`,
        url: absoluteUrl("/"),
        name: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        inLanguage: DEFAULT_LANGUAGE,
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
