import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ASSIGNMENT_STATUSES } from "@/config/stages";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Trademark Management" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["assignments-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id, agent_name, city, assigned_date, status, notes, application_id, applications:application_id(folder_number, application_name, applicant_name, service_type)")
        .order("assigned_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["assignments-all"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = data.filter((a: any) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (a.agent_name?.toLowerCase().includes(s) ||
              a.applications?.folder_number?.toLowerCase().includes(s) ||
              a.applications?.applicant_name?.toLowerCase().includes(s));
    }
    return true;
  });

  const statusColor = (s: string) =>
    s === "Cleared" ? "default" : s === "Accepted" ? "secondary" : s === "Rejected" ? "destructive" : "outline";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Assignments</h1>
        <p className="text-sm text-muted-foreground">All agent assignments across applications.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <CardTitle>{filtered.length} assignment{filtered.length === 1 ? "" : "s"}</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search agent, folder, applicant..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ASSIGNMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folder</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/applications/$id" params={{ id: a.application_id }} className="hover:underline">
                        {a.applications?.folder_number || "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{a.applications?.applicant_name || "—"}</TableCell>
                    <TableCell className="font-medium">{a.agent_name}</TableCell>
                    <TableCell>{a.city || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(a.assigned_date)}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v })}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ASSIGNMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
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
