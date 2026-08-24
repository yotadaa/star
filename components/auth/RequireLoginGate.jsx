"use client";

import { SpriteIcon } from "@/components/claude";
import LoginButton from "./LoginButton";
import useCurrentUser from "./useCurrentUser";

export default function RequireLoginGate({
  title = "Sign in to the system",
  description = "This feature requires Google authentication.",
  children,
}) {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isAuthenticated) return children;
  if (isLoading) return <div className="login-gate" role="status">Checking session...</div>;

  return (
    <div className="login-gate" role="status">
      <span className="login-gate-icon" aria-hidden="true">
        <SpriteIcon id="icon-login-key" size={22} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <LoginButton />
    </div>
  );
}
