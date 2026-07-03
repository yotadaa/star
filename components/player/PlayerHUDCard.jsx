"use client";

import { signOut } from "next-auth/react";
import LoginButton from "@/components/auth/LoginButton";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { profile } from "@/lib/data";
import IntegrityBar from "./IntegrityBar";
import LevelBadge from "./LevelBadge";
import PlayerAvatar from "./PlayerAvatar";

const summaryItems = [
  { key: "inventory", label: "Item", icon: "icon-artifact" },
  { key: "achievements", label: "Achievement", icon: "icon-medal-outline" },
  { key: "missions", label: "Misi aktif", icon: "icon-target" },
];

export default function PlayerHUDCard({
  progress,
  onOpenChat,
  onOpenPlayerTab,
}) {
  const { user, role, isAuthenticated, isLoading } = useCurrentUser();
  const isMax = !progress.level.next;
  const values = {
    inventory: progress.inventory.length,
    achievements: progress.achievements.filter((achievement) => achievement.unlocked).length,
    missions: progress.missions.filter((mission) => mission.status === "active").length,
  };
  const integrityLabel = isMax
    ? "Level maksimum tercapai"
    : `${progress.level.progress}/${progress.level.target} PP ke Lv.${progress.level.next.number}`;
  const integrityNote = isMax
    ? progress.level.current.label
    : `Menuju ${progress.level.next.label}`;

  return (
    <section
      className="player-hud-card"
      id="player-hud-card"
      role="dialog"
      aria-label="Player HUD Mukhtada"
      data-testid="player-hud-card"
    >
      <header className="player-hud-card-header">
        <div className="player-avatar-wrap player-avatar-wrap-lg">
          <PlayerAvatar size="lg" />
          <LevelBadge level={progress.level.current.number} />
        </div>
        <div>
          <h2>{profile.name}</h2>
          <p>Lv.{progress.level.current.number} · {progress.level.current.label}</p>
        </div>
      </header>

      <div className="player-integrity">
        <div className="player-integrity-heading">
          <span>System Integrity</span>
          <span>{isMax ? "MAX" : `${progress.totalPP} PP total`}</span>
        </div>
        <IntegrityBar
          current={progress.level.progress}
          target={progress.level.target}
          isMax={isMax}
          label={integrityLabel}
        />
        <p className="player-integrity-note">{integrityNote}</p>
      </div>

      <div className="player-hud-summary" aria-label="Ringkasan progres pemain">
        {summaryItems.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => onOpenPlayerTab(item.key)}
            aria-label={`Buka ${item.label}: ${values[item.key]}`}
          >
            <SpriteIcon id={item.icon} size={17} />
            <strong>{values[item.key]}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="player-hud-quick-actions">
        <PixelButton type="button" onClick={onOpenChat} className="player-hud-chat-action">
          <SpriteIcon id="icon-chat-bubble" size={15} />
          World Chat
        </PixelButton>

        {isLoading ? (
          <div className="player-hud-account-skeleton" aria-label="Memuat akun">
            <span />
            <span />
          </div>
        ) : isAuthenticated ? (
          <div className="player-hud-account">
            <div>
              <span>{role === "owner" ? "Owner" : "Visitor"}</span>
              <small>{user.email}</small>
            </div>
            <PixelButton type="button" onClick={() => signOut({ redirectTo: "/" })}>
              Logout
            </PixelButton>
          </div>
        ) : (
          <LoginButton compact className="player-hud-login" />
        )}
      </div>
    </section>
  );
}
