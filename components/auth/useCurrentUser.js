"use client";

import { useSession } from "next-auth/react";

export default function useCurrentUser() {
  const { data: session, status } = useSession();
  const user = session?.user || null;
  const role = user?.role || "visitor";

  return {
    user,
    role,
    isOwner: role === "owner",
    isAuthenticated: Boolean(user),
    isLoading: status === "loading",
    isConfigured: process.env.NEXT_PUBLIC_AUTH_ENABLED === "true",
  };
}
