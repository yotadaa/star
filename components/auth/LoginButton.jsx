"use client";

import { signIn } from "next-auth/react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import useCurrentUser from "./useCurrentUser";

export default function LoginButton({ compact = false, className = "" }) {
  const { isConfigured, isLoading } = useCurrentUser();
  const callbackUrl = typeof window === "undefined" ? "/" : window.location.href;

  return (
    <PixelButton
      className={`login-system-button ${compact ? "compact" : ""} ${className}`.trim()}
      onClick={() => signIn("google", { callbackUrl, redirectTo: callbackUrl })}
      disabled={!isConfigured || isLoading}
      aria-label="Sign in to the system"
      data-testid="login-system-button"
    >
      <SpriteIcon id="icon-login-key" size={compact ? 15 : 17} />
      <span>{isLoading ? "Loading" : compact ? "Sign in" : "Sign in to the system"}</span>
    </PixelButton>
  );
}
