import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/reports")({ component: makeStub("Reports", "Case and revenue reports.") });
