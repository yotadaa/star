"use client";

import { SpriteIcon } from "@/components/claude";
import LoginButton from "./LoginButton";
import useCurrentUser from "./useCurrentUser";

export default function RequireLoginGate({
  title = "Login ke System",
  description = "Fitur ini membutuhkan autentikasi Google sebelum bisa dipakai.",
  children,
}) {
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isAuthenticated) return children;
  if (isLoading) return <div className="login-gate" role="status">Memeriksa session...</div>;

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
