import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { STAGES, ASSIGNMENT_STATUSES, PAYMENT_STATUSES, getStage } from "@/config/stages";
import { Loader2, ArrowRight, Plus, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/applications/$id")({
  head: () => ({ meta: [{ title: "Application — Trademark Management" }] }),
  component: ApplicationDetailPage,
});

function ApplicationDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, clients(client_prefix, client_code, client_name), attorneys(name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: updates = [] } = useQuery({
    queryKey: ["stage_updates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_updates")
        .select("*")
        .eq("application_id", id)
        .order("update_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["stage_payments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("stage_payments").select("*").eq("application_id", id);
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("application_id", id)
        .order("assigned_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setTm = useMutation({
    mutationFn: async (tm: string) => {
      const { error } = await supabase.from("applications").update({ trademark_number: tm || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Trademark number updated"); qc.invalidateQueries({ queryKey: ["application", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleComplete = useMutation({
    mutationFn: async (val: boolean) => {
      const { error } = await supabase.from("applications").update({ is_complete: val }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["application", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !app) {
    return <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const currentStageDef = getStage(app.current_stage);
  const currentPayment = payments.find((p: any) => p.stage === app.current_stage);
  const paymentClear = currentPayment?.payment_status === "Received";

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/applications/trademark" className="hover:underline">{app.service_type}</Link>
            <span>/</span>
            <span className="font-mono">{app.folder_number}</span>
          </div>
          <h1 className="font-display text-2xl font-semibold">{app.application_name || app.applicant_name || app.folder_number}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>Client: <span className="text-foreground font-medium">{(app as any).clients?.client_prefix}-{(app as any).clients?.client_code} · {(app as any).clients?.client_name}</span></span>
            {app.city && <Badge variant="outline">{app.city}</Badge>}
            {app.is_complete && <Badge className="bg-emerald-700">Complete</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleComplete.mutate(!app.is_complete)}>
            {app.is_complete ? "Reopen" : <><Check className="h-4 w-4 mr-1" /> Mark complete</>}
          </Button>
        </div>
      </div>

      {/* Stage stepper */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Stage progression</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {STAGES.map((s, idx) => {
              const isDone = app.current_stage > s.number;
              const isCurrent = app.current_stage === s.number;
              return (
                <div key={s.number} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 border ${
                      isCurrent ? "bg-primary text-primary-foreground border-primary" :
                      isDone ? "bg-muted border-border" : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-mono">{s.number}</span>
                    <span className="text-sm font-medium">{s.shortTitle}</span>
                    {isDone && <Check className="h-3.5 w-3.5" />}
                  </div>
                  {idx < STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
          <div className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Current stage:</span> <span className="font-medium">{currentStageDef?.title}</span></div>
            <div><span className="text-muted-foreground">Sub-status:</span> <span className="font-medium">{app.sub_status || "—"}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stage payment:</span>
              {paymentClear ? <Badge className="bg-emerald-700">Cleared</Badge> : <Badge variant="outline" className="text-amber-700 border-amber-600/40"><AlertCircle className="h-3 w-3 mr-1" /> {currentPayment?.payment_status || "Not recorded"}</Badge>}
            </div>
            {!paymentClear && currentStageDef?.requiresPaymentBeforeNext && (
              <p className="text-xs text-amber-700 mt-2">Tip: Mark this stage's payment as <strong>Received</strong> (or override) before advancing.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Stage updates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Stage updates ({updates.length})</CardTitle>
              <AddUpdateDialog applicationId={id} currentStage={app.current_stage} onDone={() => {
                qc.invalidateQueries({ queryKey: ["stage_updates", id] });
                qc.invalidateQueries({ queryKey: ["application", id] });
              }} />
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No updates yet.</p>
              ) : (
                <ol className="space-y-3">
                  {updates.map((u: any) => (
                    <li key={u.id} className="border-l-2 border-primary/40 pl-4 py-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">S{u.stage}</Badge>
                        <span className="font-medium">{u.status}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{fmtDateTime(u.update_date)}</span>
                      </div>
                      {u.notes && <p className="text-sm text-muted-foreground mt-1">{u.notes}</p>}
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {u.hearing_date && <span>Hearing: {fmtDate(u.hearing_date)}</span>}
                        {u.journal_no && <span>Journal #{u.journal_no}</span>}
                        {u.tcs_tracking && <span>TCS: {u.tcs_tracking}</span>}
                        {u.file_url && <a href={u.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">File ↗</a>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Stage payments</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {STAGES.map((s) => {
                const p = payments.find((x: any) => x.stage === s.number);
                return <PaymentRow key={s.number} applicationId={id} stage={s.number} stageTitle={s.shortTitle} payment={p} onDone={() => qc.invalidateQueries({ queryKey: ["stage_payments", id] })} />;
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Applicant details */}
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Application info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><span className="text-muted-foreground">Folder #:</span> <span className="font-mono">{app.folder_number}</span></div>
              <TmNumberEditor current={app.trademark_number} onSave={(v) => setTm.mutate(v)} />
              <div><span className="text-muted-foreground">Service:</span> {app.service_type}</div>
              <div><span className="text-muted-foreground">Applicant type:</span> {app.applicant_type || "—"}</div>
              <div><span className="text-muted-foreground">Applicant:</span> {app.applicant_name || "—"}</div>
              <div><span className="text-muted-foreground">Trading as:</span> {app.trading_as || "—"}</div>
              <div><span className="text-muted-foreground">Address:</span> {app.applicant_address || "—"}</div>
              <div><span className="text-muted-foreground">Class:</span> {(app.class || []).join(", ") || "—"}</div>
              <div><span className="text-muted-foreground">Mark:</span> {app.mark_description || "—"}</div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Assignments ({assignments.length})</CardTitle>
              <AddAssignmentDialog applicationId={id} onDone={() => qc.invalidateQueries({ queryKey: ["assignments", id] })} />
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No assignments.</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a: any) => (
                    <li key={a.id} className="text-sm border rounded-md p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{a.agent_name}</span>
                        <Badge variant="outline">{a.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.city || "—"} · {fmtDate(a.assigned_date)}</div>
                      {a.notes && <p className="text-xs text-muted-foreground mt-1">{a.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TmNumberEditor({ current, onSave }: { current: string | null; onSave: (v: string) => void }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(current || "");
  if (!edit) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">TM #:</span>
        <span className="font-mono">{current || "—"}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setEdit(true)}>Edit</Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} className="h-7 w-32" placeholder="6 digits" />
      <Button size="sm" className="h-7" onClick={() => { onSave(val); setEdit(false); }}>Save</Button>
      <Button size="sm" variant="ghost" className="h-7" onClick={() => setEdit(false)}>Cancel</Button>
    </div>
  );
}

function PaymentRow({ applicationId, stage, stageTitle, payment, onDone }: { applicationId: string; stage: number; stageTitle: string; payment?: any; onDone: () => void }) {
  const [status, setStatus] = useState<string>(payment?.payment_status || "Due");
  const [amount, setAmount] = useState<string>(payment?.amount?.toString() || "");
  const mut = useMutation({
    mutationFn: async () => {
      const payload = {
        application_id: applicationId,
        stage,
        payment_status: status,
        amount: amount ? parseFloat(amount) : null,
        payment_date: status === "Received" ? new Date().toISOString() : payment?.payment_date || null,
      };
      const { error } = await supabase.from("stage_payments").upsert(payload, { onConflict: "application_id,stage" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(`Stage ${stage} payment saved`); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge variant="outline" className="w-20 justify-center">S{stage} {stageTitle}</Badge>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
        <SelectContent>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="h-8 w-28" />
      <Button size="sm" variant="outline" className="h-8" onClick={() => mut.mutate()} disabled={mut.isPending}>Save</Button>
    </div>
  );
}

function AddUpdateDialog({ applicationId, currentStage, onDone }: { applicationId: string; currentStage: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<string>(String(currentStage));
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [journalNo, setJournalNo] = useState("");
  const [tcs, setTcs] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const stageDef = getStage(parseInt(stage, 10));

  const mut = useMutation({
    mutationFn: async () => {
      if (!status) throw new Error("Choose a status");
      const { error } = await supabase.from("stage_updates").insert({
        application_id: applicationId,
        stage: parseInt(stage, 10),
        status,
        notes: notes.trim() || null,
        hearing_date: hearingDate || null,
        journal_no: journalNo.trim() || null,
        tcs_tracking: tcs.trim() || null,
        file_url: fileUrl.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Update added");
      setOpen(false); setStatus(""); setNotes(""); setHearingDate(""); setJournalNo(""); setTcs(""); setFileUrl("");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add update</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New stage update</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => { setStage(v); setStatus(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s.number} value={String(s.number)}>S{s.number} — {s.shortTitle}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{stageDef?.subStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Hearing date</Label>
              <Input type="date" value={hearingDate} onChange={(e) => setHearingDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Journal #</Label>
              <Input value={journalNo} onChange={(e) => setJournalNo(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>TCS tracking</Label>
              <Input value={tcs} onChange={(e) => setTcs(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>File URL</Label>
              <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddAssignmentDialog({ applicationId, onDone }: { applicationId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<string>("Pending");
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      if (!agentName.trim()) throw new Error("Agent name required");
      const { error } = await supabase.from("assignments").insert({
        application_id: applicationId,
        agent_name: agentName.trim(),
        city: city.trim() || null,
        status,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assignment added");
      setOpen(false); setAgentName(""); setCity(""); setNotes(""); setStatus("Pending");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Assign</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Assign agent</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Agent name *</Label><Input value={agentName} onChange={(e) => setAgentName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ASSIGNMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
