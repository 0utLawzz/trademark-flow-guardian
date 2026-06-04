import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLIENT_PREFIXES } from "@/config/stages";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Clients — Trademark Management" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = clients.filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      c.client_name?.toLowerCase().includes(s) ||
      c.trading_as?.toLowerCase().includes(s) ||
      `${c.client_prefix}-${c.client_code}`.toLowerCase().includes(s) ||
      c.city?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage clients and their unique prefix + code.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" className="h-9 w-64" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New client</Button>
            </DialogTrigger>
            <CreateClientDialog onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["clients"] }); }} />
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-display">All clients ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No clients yet. Create your first client to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Trading as</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.client_prefix}-{c.client_code}</TableCell>
                    <TableCell className="font-medium">{c.client_name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.trading_as || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.city || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmtDate(c.created_at)}</TableCell>
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

function CreateClientDialog({ onDone }: { onDone: () => void }) {
  const [prefix, setPrefix] = useState<string>("X");
  const [code, setCode] = useState<string>("");
  const [name, setName] = useState("");
  const [tradingAs, setTradingAs] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const codeNum = parseInt(code, 10);
      if (!name.trim()) throw new Error("Client name is required");
      if (!Number.isFinite(codeNum) || codeNum < 1) throw new Error("Client code must be a positive number");
      const { error } = await supabase.from("clients").insert({
        client_prefix: prefix,
        client_code: codeNum,
        client_name: name.trim(),
        trading_as: tradingAs.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Client created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Prefix</Label>
            <Select value={prefix} onValueChange={setPrefix}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CLIENT_PREFIXES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input type="number" value={code} onChange={(e) => setCode(e.target.value)} placeholder="202" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Client name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ABC Industries" />
        </div>
        <div className="space-y-1.5">
          <Label>Trading as</Label>
          <Input value={tradingAs} onChange={(e) => setTradingAs(e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="LHR / KHI / ISB / PES" />
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
