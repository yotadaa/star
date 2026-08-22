import { Fraunces, Silkscreen, Nunito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import SiteProvider from "@/components/site/SiteProvider";
import {
  DEFAULT_DESCRIPTION,
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
  keywords: [
    "Mukhtada Billah NST",
    "fullstack developer Indonesia",
    "AI tooling",
    "data science",
    "Universitas Jambi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
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

  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${silkscreen.variable} ${nunito.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        <a href="#main" className="skip-link">Loncat ke konten utama</a>
        <AuthProvider>
          <ConvexClientProvider>
            <SiteProvider>{children}</SiteProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
