"use client";

import { useEffect, useRef, useState } from "react";
import LoginButton from "@/components/auth/LoginButton";
import UserAvatarMenu from "@/components/auth/UserAvatarMenu";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { useSite } from "./SiteProvider";

export default function UtilityBar() {
  const barRef = useRef(null);
  const { setChatOpen } = useSite();
  const { isAuthenticated } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!barRef.current?.contains(event.target)) setMobileMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function openChat() {
    setMobileMenuOpen(false);
    setChatOpen(true);
  }

  function renderAccountAction() {
    return isAuthenticated ? <UserAvatarMenu /> : <LoginButton compact />;
  }

  return (
    <nav
      ref={barRef}
      className={`utility-bar ${mobileMenuOpen ? "is-mobile-open" : ""}`}
      aria-label="Chat dan akun"
      data-testid="utility-bar"
    >
      <div className="utility-actions utility-actions-desktop">
        <PixelButton
          className="utility-chat-button"
          onClick={openChat}
          aria-label="Buka World Chat"
          data-testid="open-world-chat"
        >
          <SpriteIcon id="icon-chat-bubble" size={16} />
          <span>Chat</span>
        </PixelButton>
        {renderAccountAction()}
      </div>

      <button
        type="button"
        className="utility-mobile-trigger"
        aria-label={mobileMenuOpen ? "Tutup menu World Chat dan Login" : "Buka menu World Chat dan Login"}
        aria-expanded={mobileMenuOpen}
        aria-controls="utility-mobile-menu"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <SpriteIcon id="icon-chat-bubble" size={16} />
      </button>

      {mobileMenuOpen && (
        <div className="utility-mobile-menu" id="utility-mobile-menu" aria-label="Aksi cepat">
          <PixelButton
            className="utility-chat-button utility-mobile-item"
            onClick={openChat}
            aria-label="Buka World Chat"
            data-testid="open-world-chat-mobile"
          >
            <SpriteIcon id="icon-chat-bubble" size={16} />
            <span>World Chat</span>
          </PixelButton>
          <div className="utility-mobile-account">
            {renderAccountAction()}
          </div>
        </div>
      )}
    </nav>
  );
}
