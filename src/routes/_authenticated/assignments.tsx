import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/assignments")({ component: makeStub("Assignments", "Case assignments and statuses.") });
