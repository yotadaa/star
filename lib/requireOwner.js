import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function requireOwner() {
  const session = await auth();

  if (!session?.user) {
    redirect("/forbidden?reason=login");
  }

  if (session.user.role !== "owner") {
    redirect("/forbidden?reason=role");
  }

  return session.user;
}
