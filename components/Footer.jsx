import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="foot-links">
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer" data-testid="foot-github">
          GITHUB
        </a>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" data-testid="foot-linkedin">
          LINKEDIN
        </a>
        <a href={profile.links.scholar} target="_blank" rel="noopener noreferrer" data-testid="foot-scholar">
          SCHOLAR
        </a>
        <a href={profile.links.blog} target="_blank" rel="noopener noreferrer" data-testid="foot-blog">
          BLOG
        </a>
      </div>
      <p className="foot-copy">
        © 2026 {profile.name.toUpperCase()} — BUILT WITH COFFEE &amp; PIXELS ·{" "}
        <a href="/#hero">↑ KEMBALI KE ATAS</a>
      </p>
    </footer>
  );
}
