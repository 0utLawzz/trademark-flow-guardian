import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — Trademark Management" }] }),
  component: JournalPage,
});

function JournalPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("journal_entries").select("*").order("journal_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: activeTms = new Set<string>() } = useQuery({
    queryKey: ["active-tm-numbers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("trademark_number").not("trademark_number", "is", null);
      if (error) throw error;
      return new Set((data || []).map((r: any) => String(r.trademark_number)));
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["journal_entries"] }); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Journal</h1>
          <p className="text-sm text-muted-foreground">Manually-recorded journal publications. Rows in <Bell className="inline h-3.5 w-3.5 text-accent-foreground align-text-bottom" /> match one of our active trademarks.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add entry</Button></DialogTrigger>
          <JournalDialog onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["journal_entries"] }); }} />
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Entries ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto my-10 text-muted-foreground" /> : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No journal entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Journal #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>TM #</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: any) => {
                  const match = r.trademark_number && activeTms.has(String(r.trademark_number));
                  return (
                    <TableRow key={r.id} className={match ? "bg-accent/10" : ""}>
                      <TableCell className="font-mono text-sm">{r.journal_no || "—"}</TableCell>
                      <TableCell>{fmtDate(r.journal_date)}</TableCell>
                      <TableCell className="font-mono text-sm flex items-center gap-1.5">
                        {r.trademark_number || "—"}
                        {match && <Bell className="h-3.5 w-3.5 text-accent-foreground" />}
                      </TableCell>
                      <TableCell>{r.application_name || "—"}</TableCell>
                      <TableCell>{r.class || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.notes || "—"}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => del.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JournalDialog({ onDone }: { onDone: () => void }) {
  const [journalNo, setJournalNo] = useState("");
  const [journalDate, setJournalDate] = useState("");
  const [tm, setTm] = useState("");
  const [appName, setAppName] = useState("");
  const [cls, setCls] = useState("");
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("journal_entries").insert({
        journal_no: journalNo.trim() || null,
        journal_date: journalDate || null,
        trademark_number: tm.trim() || null,
        application_name: appName.trim() || null,
        class: cls.trim() || null,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Added"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New journal entry</DialogTitle></DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Journal #</Label><Input value={journalNo} onChange={(e) => setJournalNo(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={journalDate} onChange={(e) => setJournalDate(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Trademark #</Label><Input value={tm} onChange={(e) => setTm(e.target.value)} placeholder="6 digits" /></div>
        <div className="space-y-1.5"><Label>Application name</Label><Input value={appName} onChange={(e) => setAppName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Class</Label><Input value={cls} onChange={(e) => setCls(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
