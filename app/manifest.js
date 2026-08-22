import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest() {
  return {
    name: `${SITE_NAME} Portfolio`,
    short_name: "Mukhtada",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#16241f",
    theme_color: "#16241f",
    lang: "id-ID",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
