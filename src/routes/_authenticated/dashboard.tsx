import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, CreditCard, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Trademark Management" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const kpis = [
    { label: "Active trademark cases", value: "—", icon: Scale },
    { label: "Clients", value: "—", icon: Users },
    { label: "Pending payments", value: "—", icon: CreditCard },
    { label: "Open assignments", value: "—", icon: ClipboardList },
  ];
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of cases, payments, and recent activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-semibold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Welcome</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>The Trademark Management System foundation is ready. Database, auth, design system, and navigation shell are in place.</p>
          <p>Next steps: build out Clients, Trademark detail with phase timeline, Payments, Agents, and Google Drive folder automation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
