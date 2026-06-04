import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/components/applications/ApplicationsList";

export const Route = createFileRoute("/_authenticated/applications/ntn")({
  head: () => ({ meta: [{ title: "NTN / Tax Return" }] }),
  component: () => <ApplicationsListPage serviceType="NTN" title="NTN / Tax Return" description="National Tax Number and tax-return filings." />,
});
