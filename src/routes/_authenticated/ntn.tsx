import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/ntn")({ component: makeStub("NTN cases", "National Tax Number registrations.") });
