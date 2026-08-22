import LoginButton from "@/components/auth/LoginButton";
import RouteStatePage from "@/components/site/RouteStatePage";

export const metadata = {
  title: "Akses Ditolak",
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
      label="// AKSES TERBATAS"
      title={needsLogin ? "Login diperlukan." : "Route ini khusus owner."}
      description={
        needsLogin
          ? "Masuk dengan Google untuk memeriksa izin akses route ini."
          : "Session aktif tidak memiliki role owner untuk membuka area pengelolaan."
      }
      icon="icon-forbidden-shield"
      secondaryHref="/blog"
      secondaryLabel="Baca Blog"
    >
      {needsLogin && (
        <div className="route-state-login">
          <LoginButton />
        </div>
      )}
    </RouteStatePage>
  );
}
