"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { PixelButton, SpriteIcon } from "@/components/claude";

const TABS = [
  { id: "world-chat", label: "World Chat", icon: "icon-chat-bubble" },
  { id: "nala", label: "Nala Config", icon: "icon-pixel-face" },
];

const EXPRESSIONS = [
  { id: "greeting", label: "Greeting", trigger: "The panel first opens" },
  { id: "thinking", label: "Thinking", trigger: "The provider is working" },
  { id: "happy", label: "Happy", trigger: "A tool finds a result" },
  { id: "pointing", label: "Pointing", trigger: "Contact or navigation" },
  { id: "confused", label: "Confused", trigger: "No result or an error" },
  { id: "idle", label: "Idle", trigger: "General summary" },
];

function formatTimestamp(value) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function TabButton({ tab, active, onSelect }) {
  return (
    <button
      type="button"
      id={`manage-tab-${tab.id}`}
      className={`manage-tab ${active ? "is-active" : ""}`}
      role="tab"
      aria-selected={active}
      aria-controls={`manage-panel-${tab.id}`}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(tab.id)}
    >
      <SpriteIcon id={tab.icon} size={16} />
      {tab.label}
    </button>
  );
}

export default function ManageCockpit({ initialSettings, keyConfigured, configWarning, guardLabel }) {
  const chatResult = useQuery(api.worldChat.listLatest, { limit: 40 });
  const [activeTab, setActiveTab] = useState("world-chat");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [chatStatus, setChatStatus] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [baselineSettings, setBaselineSettings] = useState(initialSettings);
  const [configStatus, setConfigStatus] = useState(configWarning || "");
  const [saving, setSaving] = useState(false);
  const messages = chatResult?.messages || [];
  const providerLabel = keyConfigured ? "Key configured" : "Key missing";
  const chatLabel = chatResult === undefined ? "Connecting" : `${messages.length} active ${messages.length === 1 ? "message" : "messages"}`;

  const settingsChanged = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(baselineSettings),
    [baselineSettings, settings],
  );

  function selectTab(id) {
    setActiveTab(id);
    window.requestAnimationFrame(() => document.getElementById(`manage-tab-${id}`)?.focus());
  }

  function handleTabKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = TABS.findIndex((tab) => tab.id === activeTab);
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? TABS.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    selectTab(TABS[next].id);
  }

  async function deleteMessage(id) {
    setDeleting(true);
    setChatStatus("Deleting the message through the owner route...");
    try {
      const response = await fetch(`/api/chat/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "The message could not be deleted.");
      setPendingDelete(null);
      setChatStatus("Message deleted. The Convex subscription is up to date.");
    } catch (error) {
      setChatStatus(error.message);
    } finally {
      setDeleting(false);
    }
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setConfigStatus("Saving the configuration to Convex...");
    try {
      const response = await fetch("/api/manage/nala", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "The configuration could not be saved.");
      setSettings(data.settings);
      setBaselineSettings(data.settings);
      setConfigStatus("Configuration saved. Nala will use it for the next request.");
    } catch (error) {
      setConfigStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="manage-page" data-testid="manage-page">
      <header className="manage-masthead">
        <div>
          <span className="pixel-label">// OWNER DATA CONSOLE</span>
          <h1>Data Management</h1>
          <p>Moderate the public channel and control Nala's runtime from one workbench.</p>
        </div>
        <Link href="/" className="manage-exit-link">
          <SpriteIcon id="icon-route-redirect" size={15} />
          Back to site
        </Link>
      </header>

      <div className="manage-console">
        <aside className="manage-status-rail" aria-label="System status">
          <div className="manage-rail-heading">
            <SpriteIcon id="icon-admin-shield" size={20} />
            <div>
              <span>Access state</span>
              <strong>{guardLabel}</strong>
            </div>
          </div>

          <dl className="manage-status-list">
            <div>
              <dt><SpriteIcon id="icon-database-online" size={14} /> Convex channel</dt>
              <dd>{chatLabel}</dd>
            </div>
            <div>
              <dt><SpriteIcon id={keyConfigured ? "icon-key" : "icon-lock"} size={14} /> OpenRouter</dt>
              <dd>{providerLabel}</dd>
            </div>
            <div>
              <dt><SpriteIcon id="icon-target" size={14} /> Runtime model</dt>
              <dd>{settings.model}</dd>
            </div>
          </dl>

          <p className="manage-rail-note">
            The API key stays on the server. Public chat shows active messages only. Deletions use soft delete.
          </p>
        </aside>

        <div className="manage-workbench">
          <div className="manage-tabs" role="tablist" aria-label="Data management" onKeyDown={handleTabKeyDown}>
            {TABS.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onSelect={selectTab} />
            ))}
          </div>

          {activeTab === "world-chat" && (
            <section
              id="manage-panel-world-chat"
              className="manage-panel"
              role="tabpanel"
              aria-labelledby="manage-tab-world-chat"
            >
              <div className="manage-panel-heading">
                <div>
                  <span className="pixel-label">// PUBLIC CHANNEL</span>
                  <h2>World Chat moderation</h2>
                </div>
                <span className="manage-live-chip"><span aria-hidden="true" /> Realtime</span>
              </div>

              <p className="manage-panel-intro">
                Active messages follow the same order as the public panel. Delete hides content from the feed and reply quotes without removing the audit row.
              </p>

              <div className="manage-inline-status" aria-live="polite">
                {chatStatus || (chatResult === undefined ? "Opening the Convex subscription..." : "The channel is ready for moderation.")}
              </div>

              <div className="manage-chat-list" aria-label="Active World Chat messages">
                {chatResult === undefined ? (
                  <div className="manage-empty-state" role="status">Loading active messages...</div>
                ) : messages.length === 0 ? (
                  <div className="manage-empty-state">There are no active messages to moderate.</div>
                ) : messages.map((message) => (
                  <article className="manage-chat-row" key={message.id}>
                    <div className="manage-chat-meta">
                      <div>
                        <strong>{message.authorName}</strong>
                        <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time>
                      </div>
                      <code>{message.id.slice(0, 12)}</code>
                    </div>

                    {message.replyTo && (
                      <div className="manage-chat-reply">
                        <span>Replying to {message.replyTo.authorName}</span>
                        <p>{message.replyTo.body}</p>
                      </div>
                    )}

                    <p className="manage-chat-body">{message.body}</p>

                    <div className="manage-chat-actions">
                      {pendingDelete === message.id ? (
                        <div className="manage-delete-confirm" role="group" aria-label={`Confirm deletion of ${message.authorName}'s message`}>
                          <span>Delete from the public channel?</span>
                          <PixelButton onClick={() => deleteMessage(message.id)} disabled={deleting} className="manage-delete-final">
                            {deleting ? "Deleting" : "Yes, delete"}
                          </PixelButton>
                          <PixelButton onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</PixelButton>
                        </div>
                      ) : (
                        <PixelButton className="manage-delete-trigger" onClick={() => setPendingDelete(message.id)}>
                          <SpriteIcon id="icon-lock-silhouette" size={14} />
                          Delete
                        </PixelButton>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "nala" && (
            <section
              id="manage-panel-nala"
              className="manage-panel"
              role="tabpanel"
              aria-labelledby="manage-tab-nala"
            >
              <div className="manage-panel-heading">
                <div>
                  <span className="pixel-label">// LIVE ASSISTANT</span>
                  <h2>Nala runtime config</h2>
                </div>
                <span className={`manage-provider-chip ${keyConfigured ? "is-ready" : ""}`}>
                  {providerLabel}
                </span>
              </div>

              <p className="manage-panel-intro">
                These settings apply to the next request. Credentials are never sent to the browser or stored in Convex.
              </p>

              <form className="manage-nala-form" onSubmit={saveSettings}>
                <div className="manage-form-grid">
                  <label className="manage-switch-field">
                    <span>
                      <strong>Nala live</strong>
                      <small>Kill switch that preserves the configuration.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(event) => updateSetting("enabled", event.target.checked)}
                    />
                  </label>

                  <label className="manage-field manage-field-wide">
                    <span>OpenRouter model</span>
                    <input
                      value={settings.model}
                      onChange={(event) => updateSetting("model", event.target.value)}
                      maxLength={160}
                      required
                      spellCheck="false"
                    />
                    <small>OpenRouter slug. Nemotron 3 Ultra is the default, but you can change it here.</small>
                  </label>

                  <label className="manage-field">
                    <span>Temperature</span>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.05"
                      value={settings.temperature}
                      onChange={(event) => updateSetting("temperature", Number(event.target.value))}
                    />
                  </label>

                  <label className="manage-field">
                    <span>Max tokens</span>
                    <input
                      type="number"
                      min="64"
                      max="1200"
                      step="1"
                      value={settings.maxTokens}
                      onChange={(event) => updateSetting("maxTokens", Number(event.target.value))}
                    />
                  </label>

                  <label className="manage-field manage-field-wide">
                    <span>Additional owner instructions</span>
                    <textarea
                      value={settings.systemPromptSupplement}
                      onChange={(event) => updateSetting("systemPromptSupplement", event.target.value)}
                      maxLength={2400}
                      rows={6}
                      placeholder="Leave blank to use Nala's core prompt."
                    />
                    <small>{settings.systemPromptSupplement.length}/2400 characters. Factual guardrails still apply.</small>
                  </label>
                </div>

                <div className="manage-form-footer">
                  <div>
                    <span>Last saved</span>
                    <strong>{formatTimestamp(settings.updatedAt)}</strong>
                  </div>
                  <PixelButton type="submit" disabled={saving || !settingsChanged}>
                    <SpriteIcon id="icon-database-online" size={14} />
                    {saving ? "Saving" : "Save config"}
                  </PixelButton>
                </div>
                <p className="manage-inline-status" aria-live="polite">
                  {configStatus || (settings.persisted ? "The active configuration is loaded from Convex." : "The runtime is using defaults; no configuration row exists yet.")}
                </p>
              </form>

              <section className="manage-expression-section" aria-labelledby="expression-title">
                <div>
                  <span className="pixel-label">// RESPONSE SIGNALS</span>
                  <h3 id="expression-title">Expression routing</h3>
                </div>
                <div className="manage-expression-grid">
                  {EXPRESSIONS.map((expression) => (
                    <article key={expression.id}>
                      <img
                        src={`/assets/nala/nala-${expression.id}-pixel.png`}
                        alt={`Nala ${expression.id} expression preview`}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{expression.label}</strong>
                        <span>{expression.trigger}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
