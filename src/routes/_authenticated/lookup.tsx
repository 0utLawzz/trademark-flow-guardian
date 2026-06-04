import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { getStage } from "@/config/stages";

export const Route = createFileRoute("/_authenticated/lookup")({
  head: () => ({ meta: [{ title: "Application Lookup" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) || "" }),
  component: LookupPage,
});

function LookupPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [val, setVal] = useState(q);
  useEffect(() => setVal(q), [q]);

  const { data, isLoading, isFetched } = useQuery({
    queryKey: ["lookup", q],
    enabled: q.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, clients(client_prefix, client_code, client_name)")
        .or(`trademark_number.eq.${q},folder_number.eq.${q}`)
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/lookup", search: { q: val.trim() } });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-semibold">Application Lookup</h1>
        <p className="text-sm text-muted-foreground">Quick search by trademark number or folder number.</p>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Trademark number or folder #"
            className="pl-9 h-11 text-base"
          />
        </div>
        <Button type="submit" className="h-11">Search</Button>
      </form>

      {q && (
        <div>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !data || data.length === 0 ? (
            isFetched && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No matching application found for <span className="font-mono">{q}</span>.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {data.map((a: any) => (
                <Card key={a.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      {a.application_name || a.applicant_name || a.folder_number}
                      <Badge variant="secondary">Stage {a.current_stage}</Badge>
                      {a.is_complete && <Badge className="bg-emerald-700">Complete</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                    <Field label="Folder #" value={a.folder_number} mono />
                    <Field label="TM #" value={a.trademark_number || "—"} mono />
                    <Field label="Client" value={`${a.clients?.client_prefix}-${a.clients?.client_code} · ${a.clients?.client_name}`} />
                    <Field label="Filed" value={fmtDate(a.created_at)} />
                    <Field label="Class" value={(a.class || []).join(", ") || "—"} />
                    <Field label="City" value={a.city || "—"} />
                    <Field label="Stage" value={`${a.current_stage} — ${getStage(a.current_stage)?.title}`} />
                    <Field label="Sub-status" value={a.sub_status || "—"} />
                    <Field label="Last operation" value={fmtDateTime(a.last_operation_date)} />
                    <Field label="Applicant address" value={a.applicant_address || "—"} className="sm:col-span-2" />
                    <div className="sm:col-span-2 pt-2">
                      <Link to="/applications/$id" params={{ id: a.id }}><Button variant="outline" size="sm">Open full record →</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  );
}
