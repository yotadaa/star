"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import useCurrentUser from "./useCurrentUser";

export default function UserAvatarMenu() {
  const [open, setOpen] = useState(false);
  const { user, role } = useCurrentUser();

  if (!user) return null;

  return (
    <div className="user-avatar-menu">
      <button
        type="button"
        className="utility-user-button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={`Profile picture for ${user.name || "the signed-in user"}`}
            aria-hidden="true"
            referrerPolicy="no-referrer"
          />
        ) : (
          <SpriteIcon id="icon-user-chip" size={17} />
        )}
        <span>{user.name || "User"}</span>
      </button>

      {open && (
        <div className="utility-user-menu" role="menu">
          <span className="utility-user-role">{role === "owner" ? "Owner" : "Visitor"}</span>
          <span className="utility-user-email">{user.email}</span>
          <PixelButton
            className="utility-logout-button"
            onClick={() => signOut({ redirectTo: "/" })}
            role="menuitem"
          >
            Logout
          </PixelButton>
        </div>
      )}
    </div>
  );
}
