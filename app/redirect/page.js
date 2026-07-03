import { redirect } from "next/navigation";

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
