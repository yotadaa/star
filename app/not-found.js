import RouteStatePage from "@/components/site/RouteStatePage";

export default function NotFound() {
  return (
    <RouteStatePage
      code="404"
      label="// ROUTE TIDAK DITEMUKAN"
      title="Jalur ini berhenti di sini."
      description="Alamat yang dibuka tidak terhubung ke bagian mana pun dalam sistem Mukhtada."
      icon="icon-route-lost"
      secondaryHref="/projects"
      secondaryLabel="Buka Projects"
    />
  );
}
