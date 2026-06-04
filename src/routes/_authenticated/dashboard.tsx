import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Users, CreditCard, ClipboardList, FolderKanban } from "lucide-react";
import { STAGES, SERVICE_TYPES } from "@/config/stages";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Trademark Management" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const [apps, clients, payments, recent] = await Promise.all([
        supabase.from("applications").select("id, current_stage, is_complete, service_type"),
        supabase.from("clients").select("id"),
        supabase.from("stage_payments").select("payment_status").neq("payment_status", "Received"),
        supabase.from("applications").select("id, folder_number, application_name, applicant_name, current_stage, sub_status, last_operation_date").order("last_operation_date", { ascending: false, nullsFirst: false }).limit(8),
      ]);
      return {
        apps: apps.data || [],
        clientCount: clients.data?.length || 0,
        pendingPayments: payments.data?.length || 0,
        recent: recent.data || [],
      };
    },
  });

  const apps = data?.apps || [];
  const activeTrademark = apps.filter((a) => a.service_type === "Trademark" && !a.is_complete).length;
  const stageCounts = STAGES.map((s) => ({ stage: s, count: apps.filter((a) => a.current_stage === s.number && !a.is_complete).length }));

  const kpis = [
    { label: "Active trademark cases", value: activeTrademark, icon: Scale, to: "/applications/trademark" },
    { label: "Clients", value: data?.clientCount ?? 0, icon: Users, to: "/clients" },
    { label: "Pending payments", value: data?.pendingPayments ?? 0, icon: CreditCard, to: "/applications/trademark" },
    { label: "Total applications", value: apps.length, icon: FolderKanban, to: "/applications/trademark" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of cases, payments, and recent activity.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
                <k.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-semibold">{k.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Open applications by stage</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stageCounts.map((s) => (
                <li key={s.stage.number} className="flex items-center justify-between text-sm">
                  <span><Badge variant="outline" className="mr-2">S{s.stage.number}</Badge>{s.stage.title}</span>
                  <span className="font-semibold">{s.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Recent activity</CardTitle></CardHeader>
          <CardContent>
            {(data?.recent || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {data!.recent.map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link to="/applications/$id" params={{ id: r.id }} className="hover:underline truncate">
                      <span className="font-mono text-xs text-muted-foreground mr-2">{r.folder_number}</span>
                      {r.application_name || r.applicant_name || "—"}
                    </Link>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(r.last_operation_date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
