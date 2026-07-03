"use client";

import Link from "next/link";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";

export default function BlogAdminTable({ posts }) {
  return (
    <RequireLoginGate
      title="Login ke System"
      description="Admin CMS membutuhkan autentikasi owner. Setelah Auth.js/Supabase siap, tabel ini akan mengelola draft dan published post."
    >
      <section className="blog-admin-panel hardcard">
        <div className="blog-admin-topbar">
          <div>
            <span className="pixel-label">// CMS CONTROL</span>
            <h2>Post Registry</h2>
          </div>
          <PixelButton as="a" href="/blog/admin/new" className="blog-new-button">
            <SpriteIcon id="icon-editor-blocks" size={15} />
            Tulis Baru
          </PixelButton>
        </div>
        <div className="blog-admin-table-wrap">
          <table className="blog-admin-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td><span className="blog-status-pill">{post.status}</span></td>
                  <td>{post.tags.join(" / ")}</td>
                  <td>
                    <Link href={`/blog/admin/${post.id}/edit`}>Edit</Link>
                    <Link href={`/blog/${post.slug}`}>Preview</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </RequireLoginGate>
  );
}
