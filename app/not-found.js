import RouteStatePage from "@/components/site/RouteStatePage";

export default function NotFound() {
  return (
    <RouteStatePage
      code="404"
      label="// ROUTE NOT FOUND"
      title="This path ends here."
      description="The address does not connect to any part of Mukhtada's system."
      icon="icon-route-lost"
      secondaryHref="/projects"
      secondaryLabel="Open Projects"
    />
  );
}
