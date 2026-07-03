"use client";

import LoginButton from "@/components/auth/LoginButton";
import UserAvatarMenu from "@/components/auth/UserAvatarMenu";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { useSite } from "./SiteProvider";

export default function UtilityBar() {
  const { setChatOpen } = useSite();
  const { isAuthenticated } = useCurrentUser();

  return (
    <nav className="utility-bar" aria-label="Chat dan akun" data-testid="utility-bar">
      <PixelButton
        className="utility-chat-button"
        onClick={() => setChatOpen(true)}
        aria-label="Buka World Chat"
        data-testid="open-world-chat"
      >
        <SpriteIcon id="icon-chat-bubble" size={16} />
        <span>Chat</span>
      </PixelButton>
      {isAuthenticated ? <UserAvatarMenu /> : <LoginButton compact />}
    </nav>
  );
}
