import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/copyright")({ component: makeStub("Copyright cases", "Copyright registrations.") });
