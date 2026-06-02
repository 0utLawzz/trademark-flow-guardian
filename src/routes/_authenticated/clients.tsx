import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/clients")({ component: makeStub("Clients", "Manage clients and their unique client codes.") });
