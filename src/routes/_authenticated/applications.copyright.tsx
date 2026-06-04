import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/components/applications/ApplicationsList";

export const Route = createFileRoute("/_authenticated/applications/copyright")({
  head: () => ({ meta: [{ title: "Copyright Applications" }] }),
  component: () => <ApplicationsListPage serviceType="Copyright" title="Copyright applications" description="Copyright registrations." />,
});
