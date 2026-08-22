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
  { id: "greeting", label: "Greeting", trigger: "Panel pertama dibuka" },
  { id: "thinking", label: "Thinking", trigger: "Provider sedang bekerja" },
  { id: "happy", label: "Happy", trigger: "Tool menemukan data" },
  { id: "pointing", label: "Pointing", trigger: "Kontak atau navigasi" },
  { id: "confused", label: "Confused", trigger: "Kosong atau gagal" },
  { id: "idle", label: "Idle", trigger: "Ringkasan umum" },
];

function formatTimestamp(value) {
  if (!value) return "Belum disimpan";
  return new Intl.DateTimeFormat("id-ID", {
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
  const providerLabel = keyConfigured ? "Key terpasang" : "Key belum ada";
  const chatLabel = chatResult === undefined ? "Menyambung" : `${messages.length} pesan aktif`;

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
    setChatStatus("Menghapus pesan melalui jalur owner...");
    try {
      const response = await fetch(`/api/chat/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Pesan gagal dihapus.");
      setPendingDelete(null);
      setChatStatus("Pesan dihapus. Subscription Convex sudah diperbarui.");
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
    setConfigStatus("Menyimpan konfigurasi ke Convex...");
    try {
      const response = await fetch("/api/manage/nala", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Konfigurasi gagal disimpan.");
      setSettings(data.settings);
      setBaselineSettings(data.settings);
      setConfigStatus("Konfigurasi tersimpan. Request Nala berikutnya memakai nilai ini.");
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
          <p>Moderasi channel publik dan kendali runtime Nala dalam satu workbench.</p>
        </div>
        <Link href="/" className="manage-exit-link">
          <SpriteIcon id="icon-route-redirect" size={15} />
          Kembali ke situs
        </Link>
      </header>

      <div className="manage-console">
        <aside className="manage-status-rail" aria-label="Status sistem">
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
            API key tetap di server. Chat publik hanya menampilkan pesan aktif. Penghapusan memakai soft delete.
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
                Pesan aktif diurutkan seperti panel publik. Delete menyembunyikan isi dari feed dan kutipan balasan tanpa menghapus audit row.
              </p>

              <div className="manage-inline-status" aria-live="polite">
                {chatStatus || (chatResult === undefined ? "Membuka subscription Convex..." : "Channel siap dimoderasi.")}
              </div>

              <div className="manage-chat-list" aria-label="Pesan World Chat aktif">
                {chatResult === undefined ? (
                  <div className="manage-empty-state" role="status">Memuat pesan aktif...</div>
                ) : messages.length === 0 ? (
                  <div className="manage-empty-state">Tidak ada pesan aktif untuk dimoderasi.</div>
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
                        <span>Membalas {message.replyTo.authorName}</span>
                        <p>{message.replyTo.body}</p>
                      </div>
                    )}

                    <p className="manage-chat-body">{message.body}</p>

                    <div className="manage-chat-actions">
                      {pendingDelete === message.id ? (
                        <div className="manage-delete-confirm" role="group" aria-label={`Konfirmasi hapus pesan ${message.authorName}`}>
                          <span>Hapus dari channel publik?</span>
                          <PixelButton onClick={() => deleteMessage(message.id)} disabled={deleting} className="manage-delete-final">
                            {deleting ? "Menghapus" : "Ya, hapus"}
                          </PixelButton>
                          <PixelButton onClick={() => setPendingDelete(null)} disabled={deleting}>Batal</PixelButton>
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
                Pengaturan ini berlaku pada request berikutnya. Credential tidak pernah dikirim ke browser atau disimpan di Convex.
              </p>

              <form className="manage-nala-form" onSubmit={saveSettings}>
                <div className="manage-form-grid">
                  <label className="manage-switch-field">
                    <span>
                      <strong>Nala live</strong>
                      <small>Kill switch tanpa menghapus konfigurasi.</small>
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
                    <small>Slug OpenRouter; default-nya Nemotron 3 Ultra, tetapi tetap bisa diganti di sini.</small>
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
                    <span>Instruksi tambahan owner</span>
                    <textarea
                      value={settings.systemPromptSupplement}
                      onChange={(event) => updateSetting("systemPromptSupplement", event.target.value)}
                      maxLength={2400}
                      rows={6}
                      placeholder="Kosong berarti memakai prompt inti Nala."
                    />
                    <small>{settings.systemPromptSupplement.length}/2400 karakter. Guardrail faktual tetap berlaku.</small>
                  </label>
                </div>

                <div className="manage-form-footer">
                  <div>
                    <span>Terakhir disimpan</span>
                    <strong>{formatTimestamp(settings.updatedAt)}</strong>
                  </div>
                  <PixelButton type="submit" disabled={saving || !settingsChanged}>
                    <SpriteIcon id="icon-database-online" size={14} />
                    {saving ? "Menyimpan" : "Simpan config"}
                  </PixelButton>
                </div>
                <p className="manage-inline-status" aria-live="polite">
                  {configStatus || (settings.persisted ? "Konfigurasi aktif dibaca dari Convex." : "Runtime memakai nilai default; belum ada row konfigurasi.")}
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
                      <img src={`/assets/nala/nala-${expression.id}-pixel.png`} alt="" aria-hidden="true" />
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
