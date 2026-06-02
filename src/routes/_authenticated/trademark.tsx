import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/trademark")({ component: makeStub("Trademark cases", "All trademark applications, phases, and statuses.") });
