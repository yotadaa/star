import LoginButton from "@/components/auth/LoginButton";
import RouteStatePage from "@/components/site/RouteStatePage";

export const metadata = {
  title: "Access Denied",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ForbiddenPage({ searchParams }) {
  const { reason } = await searchParams;
  const needsLogin = reason === "login";

  return (
    <RouteStatePage
      code="403"
      label="// RESTRICTED ACCESS"
      title={needsLogin ? "Sign-in required." : "This route is owner-only."}
      description={
        needsLogin
          ? "Sign in with Google so the system can check access to this route."
          : "The active session does not have the owner role required for the management area."
      }
      icon="icon-forbidden-shield"
      secondaryHref="/blog"
      secondaryLabel="Read Blog"
    >
      {needsLogin && (
        <div className="route-state-login">
          <LoginButton />
        </div>
      )}
    </RouteStatePage>
  );
}
