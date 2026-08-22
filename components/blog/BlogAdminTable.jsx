"use client";

import Link from "next/link";
import { useState } from "react";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";

export default function BlogAdminTable({ posts, source = "local", warnings = [] }) {
  const [items, setItems] = useState(posts);
  const [actionState, setActionState] = useState({ id: null, message: "" });

  async function updateStatus(post, status) {
    setActionState({ id: post.id, message: "Menyimpan..." });
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Update failed");
      setItems((current) => (status === "archived" ? current.filter((item) => item.id !== post.id) : current.map((item) => (item.id === post.id ? data.post : item))));
      setActionState({ id: null, message: status === "archived" ? "Archived" : `Status: ${status}` });
    } catch (error) {
      setActionState({ id: null, message: error.message });
    }
  }

  return (
    <RequireLoginGate
      title="Login ke System"
      description="Admin CMS membutuhkan autentikasi owner untuk mengelola draft dan published post di Convex."
    >
      <section className="blog-admin-panel hardcard">
        <div className="blog-admin-topbar">
          <div>
            <span className="pixel-label">// CMS CONTROL</span>
            <h2>Post Registry</h2>
            <p className="blog-admin-source">Source: {source}{warnings.length ? ` / ${warnings.slice(0, 1).join(" ")}` : ""}</p>
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
              {items.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td><span className="blog-status-pill">{post.status}</span></td>
                  <td>{post.tags.join(" / ")}</td>
                  <td>
                    <Link href={`/blog/admin/${post.id}/edit`}>Edit</Link>
                    <Link href={`/blog/${post.slug}`}>Preview</Link>
                    <button type="button" disabled={actionState.id === post.id} onClick={() => updateStatus(post, post.status === "published" ? "draft" : "published")}>
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" disabled={actionState.id === post.id} onClick={() => updateStatus(post, "archived")}>
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {actionState.message && <p className="blog-admin-action-state" role="status">{actionState.message}</p>}
      </section>
    </RequireLoginGate>
  );
}
