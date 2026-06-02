import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/agents")({ component: makeStub("Agents", "Agents that cases are assigned to.") });
