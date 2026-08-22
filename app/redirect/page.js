import { redirect } from "next/navigation";

export const metadata = {
  title: "Mengalihkan",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const ROUTES = {
  home: "/",
  about: "/about",
  projects: "/projects",
  research: "/research",
  blog: "/blog",
  contact: "/contact",
};

export default async function RedirectPage({ searchParams }) {
  const { to } = await searchParams;
  redirect(ROUTES[to] || "/");
}
