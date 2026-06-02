import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/company")({ component: makeStub("Company cases", "Company incorporations and filings.") });
