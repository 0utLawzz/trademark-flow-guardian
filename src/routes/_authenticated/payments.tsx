import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/payments")({ component: makeStub("Payments", "Phase payments and clearance.") });
