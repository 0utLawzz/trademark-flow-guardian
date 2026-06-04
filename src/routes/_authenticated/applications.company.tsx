import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/components/applications/ApplicationsList";

export const Route = createFileRoute("/_authenticated/applications/company")({
  head: () => ({ meta: [{ title: "Company Applications" }] }),
  component: () => <ApplicationsListPage serviceType="Company" title="Company applications" description="Company incorporations and filings." />,
});
