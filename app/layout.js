import { Fraunces, Silkscreen, Nunito } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import SiteProvider from "@/components/site/SiteProvider";

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
  title: "Mukhtada Billah NST - Builder's Journey",
  description:
    "Fullstack builder, AI tinkerer, dan peneliti data dari Universitas Jambi. Portofolio kabin senja 2.5D.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='10' fill='%23ecb63f'/></svg>",
  },
};

export const viewport = {
  themeColor: "#0c1f2b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${silkscreen.variable} ${nunito.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">Loncat ke konten utama</a>
        <AuthProvider>
          <SiteProvider>{children}</SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
