"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoginButton from "@/components/auth/LoginButton";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";

function readableDate(value) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function BlogEngagement({ slug, initialUpvoteCount = 0, viewerToken, canModerate = false }) {
  const { user, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const result = useQuery(api.blogEngagement.listComments, {
    slug,
    limit: 60,
    ...(viewerToken ? { viewerToken } : {}),
  });
  const comments = result?.comments || [];
  const [upvote, setUpvote] = useState({ count: Math.max(0, Number(initialUpvoteCount || 0)), voted: false });
  const [voteBusy, setVoteBusy] = useState(false);
  const [voteStatus, setVoteStatus] = useState("Memeriksa dukungan browser ini...");
  const [draft, setDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentStatus, setCommentStatus] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/blog/posts/${encodeURIComponent(slug)}/upvote`, { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Status upvote tidak tersedia");
        if (active) {
          setUpvote({ count: data.count, voted: data.voted });
          setVoteStatus(data.voted ? "Browser ini sudah mendukung tulisan." : "Belum ada dukungan dari browser ini.");
        }
      })
      .catch((error) => {
        if (active) setVoteStatus(error.message);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function toggleUpvote() {
    setVoteBusy(true);
    setVoteStatus("Menyinkronkan dukungan...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/upvote`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Upvote gagal");
      setUpvote({ count: data.count, voted: data.voted });
      setVoteStatus(data.voted ? "Dukungan tercatat." : "Dukungan dibatalkan.");
    } catch (error) {
      setVoteStatus(error.message);
    } finally {
      setVoteBusy(false);
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setCommentBusy(true);
    setCommentStatus("Mengirim catatan pembaca...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Komentar gagal dikirim");
      setDraft("");
      setCommentStatus("Komentar terbit dan tersinkron lewat Convex.");
    } catch (error) {
      setCommentStatus(error.message);
    } finally {
      setCommentBusy(false);
    }
  }

  async function deleteComment(id) {
    setCommentStatus("Menghapus komentar...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Komentar gagal dihapus");
      setCommentStatus("Komentar dihapus dari ruang baca.");
    } catch (error) {
      setCommentStatus(error.message);
    }
  }

  return (
    <section className="blog-engagement" aria-labelledby="blog-engagement-title">
      <header className="blog-engagement-heading">
        <div>
          <span className="pixel-label">// READER SIGNAL</span>
          <h2 id="blog-engagement-title">Jejak pembaca</h2>
        </div>
        <span className="blog-comment-total">{comments.length} komentar</span>
      </header>

      <div className="blog-engagement-ledger">
        <aside className="blog-upvote-panel" aria-label="Dukungan tulisan">
          <span className="blog-upvote-kicker">Apresiasi tanpa akun</span>
          <strong>{upvote.count}</strong>
          <span>dukungan tercatat</span>
          <PixelButton
            type="button"
            className={`blog-upvote-button${upvote.voted ? " is-voted" : ""}`}
            onClick={toggleUpvote}
            disabled={voteBusy}
            aria-pressed={upvote.voted}
          >
            <SpriteIcon id="icon-chevron-up" size={16} />
            {voteBusy ? "Sinkron" : upvote.voted ? "Didukung" : "Dukung"}
          </PixelButton>
          <p aria-live="polite">{voteStatus}</p>
        </aside>

        <div className="blog-comment-panel">
          <div className="blog-comment-intro">
            <div>
              <span className="pixel-label">// FIELD NOTES</span>
              <h3>Komentar</h3>
            </div>
            {user?.name ? <span>Masuk sebagai {user.name}</span> : null}
          </div>

          {userLoading ? (
            <p className="blog-comment-auth-note">Memeriksa sesi...</p>
          ) : isAuthenticated ? (
            <form className="blog-comment-form" onSubmit={submitComment}>
              <label htmlFor="blog-comment-body">Tambahkan catatan</label>
              <textarea
                id="blog-comment-body"
                rows={4}
                maxLength={800}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Tulis tanggapan yang spesifik dan relevan..."
              />
              <div>
                <span>{draft.length} / 800</span>
                <PixelButton type="submit" disabled={commentBusy || !draft.trim()}>
                  <SpriteIcon id="icon-send" size={14} />
                  {commentBusy ? "Mengirim" : "Kirim komentar"}
                </PixelButton>
              </div>
            </form>
          ) : (
            <div className="blog-comment-login">
              <p>Komentar memakai identitas Google yang aktif; alamat email tidak dipublikasikan.</p>
              <LoginButton compact />
            </div>
          )}

          <p className="blog-comment-status" aria-live="polite">{commentStatus}</p>

          <div className="blog-comment-list" aria-busy={result === undefined}>
            {result === undefined ? (
              <p className="blog-comment-empty">Membuka catatan pembaca...</p>
            ) : comments.length === 0 ? (
              <p className="blog-comment-empty">Belum ada komentar. Ruang ini masih bersih.</p>
            ) : comments.map((comment, index) => (
              <article className="blog-comment-row" key={comment.id}>
                <span className="blog-comment-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <header>
                    <strong>{comment.authorName}</strong>
                    <time dateTime={comment.createdAt}>{readableDate(comment.createdAt)}</time>
                  </header>
                  <p>{comment.body}</p>
                </div>
                {(canModerate || comment.canDelete) && (
                  <button type="button" onClick={() => deleteComment(comment.id)} aria-label={`Hapus komentar ${comment.authorName}`}>
                    <SpriteIcon id="icon-trash" size={13} />
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
