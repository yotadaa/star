"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoginButton from "@/components/auth/LoginButton";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";

function readableDate(value) {
  try {
    return new Intl.DateTimeFormat("en-US", {
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
  const [voteStatus, setVoteStatus] = useState("Checking this browser's vote...");
  const [draft, setDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentStatus, setCommentStatus] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/blog/posts/${encodeURIComponent(slug)}/upvote`, { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Vote status is unavailable");
        if (active) {
          setUpvote({ count: data.count, voted: data.voted });
          setVoteStatus(data.voted ? "This browser has upvoted the article." : "This browser has not upvoted yet.");
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
    setVoteStatus("Syncing vote...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/upvote`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "The vote could not be updated");
      setUpvote({ count: data.count, voted: data.voted });
      setVoteStatus(data.voted ? "Vote recorded." : "Vote removed.");
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
    setCommentStatus("Publishing your comment...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "The comment could not be published");
      setDraft("");
      setCommentStatus("Comment published and synced through Convex.");
    } catch (error) {
      setCommentStatus(error.message);
    } finally {
      setCommentBusy(false);
    }
  }

  async function deleteComment(id) {
    setCommentStatus("Deleting comment...");
    try {
      const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "The comment could not be deleted");
      setCommentStatus("Comment removed from the reader thread.");
    } catch (error) {
      setCommentStatus(error.message);
    }
  }

  return (
    <section className="blog-engagement" aria-labelledby="blog-engagement-title">
      <header className="blog-engagement-heading">
        <div>
          <span className="pixel-label">// READER SIGNAL</span>
          <h2 id="blog-engagement-title">Reader notes</h2>
        </div>
        <span className="blog-comment-total">{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
      </header>

      <div className="blog-engagement-ledger">
        <aside className="blog-upvote-panel" aria-label="Article votes">
          <span className="blog-upvote-kicker">No account required</span>
          <strong>{upvote.count}</strong>
          <span>{upvote.count === 1 ? "vote recorded" : "votes recorded"}</span>
          <PixelButton
            type="button"
            className={`blog-upvote-button${upvote.voted ? " is-voted" : ""}`}
            onClick={toggleUpvote}
            disabled={voteBusy}
            aria-pressed={upvote.voted}
          >
            <SpriteIcon id="icon-chevron-up" size={16} />
            {voteBusy ? "Syncing" : upvote.voted ? "Upvoted" : "Upvote"}
          </PixelButton>
          <p aria-live="polite">{voteStatus}</p>
        </aside>

        <div className="blog-comment-panel">
          <div className="blog-comment-intro">
            <div>
              <span className="pixel-label">// FIELD NOTES</span>
              <h3>Comments</h3>
            </div>
            {user?.name ? <span>Signed in as {user.name}</span> : null}
          </div>

          {userLoading ? (
            <p className="blog-comment-auth-note">Checking your session...</p>
          ) : isAuthenticated ? (
            <form className="blog-comment-form" onSubmit={submitComment}>
              <label htmlFor="blog-comment-body">Add a comment</label>
              <textarea
                id="blog-comment-body"
                rows={4}
                maxLength={800}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a specific, relevant response..."
              />
              <div>
                <span>{draft.length} / 800</span>
                <PixelButton type="submit" disabled={commentBusy || !draft.trim()}>
                  <SpriteIcon id="icon-send" size={14} />
                  {commentBusy ? "Publishing" : "Post comment"}
                </PixelButton>
              </div>
            </form>
          ) : (
            <div className="blog-comment-login">
              <p>Comments use your signed-in Google identity. Your email address is never published.</p>
              <LoginButton compact />
            </div>
          )}

          <p className="blog-comment-status" aria-live="polite">{commentStatus}</p>

          <div className="blog-comment-list" aria-busy={result === undefined}>
            {result === undefined ? (
              <p className="blog-comment-empty">Loading reader comments...</p>
            ) : comments.length === 0 ? (
              <p className="blog-comment-empty">No comments yet. Start the conversation.</p>
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
                  <button type="button" onClick={() => deleteComment(comment.id)} aria-label={`Delete comment by ${comment.authorName}`}>
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
