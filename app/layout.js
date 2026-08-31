import { Fraunces, Silkscreen, Nunito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import SiteProvider from "@/components/site/SiteProvider";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_LANGUAGE,
  DEFAULT_OG_LOCALE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  siteStructuredData,
} from "@/lib/seo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: "/" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "portfolio",
  keywords: DEFAULT_KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: DEFAULT_OG_LOCALE,
    url: "/",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#0c1f2b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const structuredData = JSON.stringify(siteStructuredData()).replace(/</g, "\\u003c");
  const convexDeploymentUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  if (!convexDeploymentUrl) {
    throw new Error("CONVEX_CLOUD_URL is required before starting Next.js.");
  }

  return (
    <html
      lang={DEFAULT_LANGUAGE}
      className={`${fraunces.variable} ${silkscreen.variable} ${nunito.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        <a href="#main" className="skip-link">Skip to main content</a>
        <AuthProvider>
          <ConvexClientProvider deploymentUrl={convexDeploymentUrl}>
            <SiteProvider>{children}</SiteProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
