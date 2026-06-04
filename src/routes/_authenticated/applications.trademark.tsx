import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/components/applications/ApplicationsList";

export const Route = createFileRoute("/_authenticated/applications/trademark")({
  head: () => ({ meta: [{ title: "Trademark Applications" }] }),
  component: () => <ApplicationsListPage serviceType="Trademark" title="Trademark applications" description="All trademark filings with stage and status." />,
});
