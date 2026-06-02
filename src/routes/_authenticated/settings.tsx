import { createFileRoute } from "@tanstack/react-router";
import { makeStub } from "@/lib/stub-page";
export const Route = createFileRoute("/_authenticated/settings")({ component: makeStub("Settings", "Google Drive connection and account preferences.") });
