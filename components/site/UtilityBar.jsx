"use client";

import { PixelButton, SpriteIcon } from "@/components/claude";
import PlayerHUD from "@/components/player/PlayerHUD";
import { useSite } from "./SiteProvider";

export default function UtilityBar() {
  const { setChatOpen } = useSite();

  function openChat() {
    setChatOpen(true);
  }

  return (
    <nav
      className="utility-bar"
      aria-label="World Chat dan Player HUD"
      data-testid="utility-bar"
    >
      <div className="utility-actions">
        <PixelButton
          className="utility-chat-button"
          onClick={openChat}
          aria-label="Buka World Chat"
          data-testid="open-world-chat"
        >
          <SpriteIcon id="icon-chat-bubble" size={16} />
          <span>Chat</span>
        </PixelButton>
        <PlayerHUD />
      </div>
    </nav>
  );
}
