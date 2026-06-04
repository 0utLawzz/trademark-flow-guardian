import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Bell } from "lucide-react";
import { toast } from "sonner";
import { APPLICANT_TYPES, CITY_CODES, STAGES, type ServiceType } from "@/config/stages";
import { fmtDate } from "@/lib/format";

export function ApplicationsListPage({
  serviceType,
  title,
  description,
}: {
  serviceType: ServiceType;
  title: string;
  description: string;
}) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["applications", serviceType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, clients(client_prefix, client_code, client_name)")
        .eq("service_type", serviceType)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: alertTmNumbers = new Set<string>() } = useQuery({
    queryKey: ["tm-alert-numbers"],
    queryFn: async () => {
      const [j, i] = await Promise.all([
        supabase.from("journal_entries").select("trademark_number"),
        supabase.from("ipo_entries").select("trademark_number"),
      ]);
      const set = new Set<string>();
      [...(j.data || []), ...(i.data || [])].forEach((r: any) => {
        if (r.trademark_number) set.add(String(r.trademark_number));
      });
      return set;
    },
  });

  const filtered = useMemo(() => {
    return apps.filter((a: any) => {
      if (stageFilter !== "all" && String(a.current_stage) !== stageFilter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        a.folder_number?.toLowerCase().includes(s) ||
        a.trademark_number?.toLowerCase().includes(s) ||
        a.application_name?.toLowerCase().includes(s) ||
        a.applicant_name?.toLowerCase().includes(s)
      );
    });
  }, [apps, q, stageFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search folder, TM number, applicant…" className="h-9 w-72" />
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s.number} value={String(s.number)}>Stage {s.number} — {s.shortTitle}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New application</Button>
            </DialogTrigger>
            <CreateApplicationDialog
              serviceType={serviceType}
              onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["applications", serviceType] }); }}
            />
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">{filtered.length} record(s)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folder</TableHead>
                  <TableHead>TM #</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Sub-status</TableHead>
                  <TableHead>Last op</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a: any) => {
                  const alert = a.trademark_number && alertTmNumbers.has(a.trademark_number);
                  return (
                    <TableRow key={a.id} className="cursor-pointer">
                      <TableCell className="font-mono text-sm">
                        <Link to="/applications/$id" params={{ id: a.id }} className="hover:underline">{a.folder_number}</Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm flex items-center gap-1.5">
                        {a.trademark_number || <span className="text-muted-foreground">—</span>}
                        {alert && <Bell className="h-3.5 w-3.5 text-accent-foreground" />}
                      </TableCell>
                      <TableCell className="font-medium">{a.applicant_name || a.application_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{(a.class || []).join(", ") || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Stage {a.current_stage}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{a.sub_status || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmtDate(a.last_operation_date)}</TableCell>
                      <TableCell>
                        <Link to="/applications/$id" params={{ id: a.id }}>
                          <Button variant="ghost" size="sm">Open</Button>
                        </Link>
                      </TableCell>
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

function CreateApplicationDialog({ serviceType, onDone }: { serviceType: ServiceType; onDone: () => void }) {
  const [clientId, setClientId] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const [applicantType, setApplicantType] = useState<string>("Sole Proprietor");
  const [applicantName, setApplicantName] = useState("");
  const [tradingAs, setTradingAs] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [classesText, setClassesText] = useState("");
  const [city, setCity] = useState<string>("LHR");
  const [markDescription, setMarkDescription] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, client_prefix, client_code, client_name").order("client_name");
      if (error) throw error;
      return data;
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error("Choose a client");
      const { data: folder, error: fnErr } = await supabase.rpc("generate_folder_number", { p_client_id: clientId });
      if (fnErr) throw fnErr;
      const classes = classesText.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase.from("applications").insert({
        folder_number: folder,
        client_id: clientId,
        service_type: serviceType,
        application_name: applicationName.trim() || null,
        applicant_type: applicantType,
        applicant_name: applicantName.trim() || null,
        trading_as: tradingAs.trim() || null,
        applicant_address: applicantAddress.trim() || null,
        class: classes,
        city,
        mark_description: markDescription.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Application created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New {serviceType} application</DialogTitle></DialogHeader>
      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label>Client *</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              {clients.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.client_prefix}-{c.client_code} · {c.client_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Application / mark name</Label>
          <Input value={applicationName} onChange={(e) => setApplicationName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Applicant type</Label>
            <Select value={applicantType} onValueChange={setApplicantType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{APPLICANT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CITY_CODES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Applicant name</Label>
          <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Trading as</Label>
          <Input value={tradingAs} onChange={(e) => setTradingAs(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Applicant address</Label>
          <Input value={applicantAddress} onChange={(e) => setApplicantAddress(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Class(es) — comma separated</Label>
          <Input value={classesText} onChange={(e) => setClassesText(e.target.value)} placeholder="9, 35, 42" />
        </div>
        <div className="space-y-1.5">
          <Label>Mark description</Label>
          <Input value={markDescription} onChange={(e) => setMarkDescription(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
