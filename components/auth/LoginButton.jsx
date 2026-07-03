"use client";

import { signIn } from "next-auth/react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import useCurrentUser from "./useCurrentUser";

export default function LoginButton({ compact = false, className = "" }) {
  const { isConfigured, isLoading } = useCurrentUser();

  return (
    <PixelButton
      className={`login-system-button ${compact ? "compact" : ""} ${className}`.trim()}
      onClick={() => signIn("google", { redirectTo: window.location.href })}
      disabled={!isConfigured || isLoading}
      aria-label="Login ke System"
      data-testid="login-system-button"
    >
      <SpriteIcon id="icon-login-key" size={compact ? 15 : 17} />
      <span>{isLoading ? "Memuat" : compact ? "Login" : "Login ke System"}</span>
    </PixelButton>
  );
}
