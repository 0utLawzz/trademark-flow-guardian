import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYMENT_STATUSES, STAGES } from "@/config/stages";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments — Trademark Management" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["payments-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_payments")
        .select("id, stage, payment_status, amount, payment_date, notes, application_id, applications:application_id(folder_number, applicant_name, application_name, service_type)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = data.filter((p: any) => {
    if (statusFilter !== "all" && p.payment_status !== statusFilter) return false;
    if (stageFilter !== "all" && String(p.stage) !== stageFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (p.applications?.folder_number?.toLowerCase().includes(s) ||
              p.applications?.applicant_name?.toLowerCase().includes(s));
    }
    return true;
  });

  const totals = {
    received: data.filter((p: any) => p.payment_status === "Received").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
    due: data.filter((p: any) => p.payment_status === "Due").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
    balance: data.filter((p: any) => p.payment_status === "Balance").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
  };

  const statusVariant = (s: string) => s === "Received" ? "default" : s === "Balance" ? "secondary" : "outline";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground">All stage payments across applications.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-normal">Received</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.received.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-normal">Outstanding (Balance)</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.balance.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground font-normal">Due</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totals.due.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <CardTitle>{filtered.length} payment{filtered.length === 1 ? "" : "s"}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Search folder or applicant..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {STAGES.map((s) => <SelectItem key={s.number} value={String(s.number)}>Stage {s.number} — {s.shortTitle}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments match the current filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folder</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/applications/$id" params={{ id: p.application_id }} className="hover:underline">
                        {p.applications?.folder_number || "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{p.applications?.applicant_name || "—"}</TableCell>
                    <TableCell>Stage {p.stage}</TableCell>
                    <TableCell><Badge variant={statusVariant(p.payment_status) as any}>{p.payment_status}</Badge></TableCell>
                    <TableCell className="text-right">{p.amount ? Number(p.amount).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.payment_date ? fmtDate(p.payment_date) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
