import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agents")({
  head: () => ({ meta: [{ title: "Agents — Trademark Management" }] }),
  component: AgentsPage,
});

interface Attorney {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
}

function AgentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Attorney | null>(null);
  const [form, setForm] = useState({ name: "", address: "", city: "" });

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["attorneys"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attorneys").select("*").order("name");
      if (error) throw error;
      return data as Attorney[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      const payload = { name: form.name.trim(), address: form.address || null, city: form.city || null };
      if (editing) {
        const { error } = await supabase.from("attorneys").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attorneys").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Agent updated" : "Agent added");
      qc.invalidateQueries({ queryKey: ["attorneys"] });
      setOpen(false);
      setEditing(null);
      setForm({ name: "", address: "", city: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attorneys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agent removed");
      qc.invalidateQueries({ queryKey: ["attorneys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (a: Attorney) => {
    setEditing(a);
    setForm({ name: a.name, address: a.address || "", city: a.city || "" });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", address: "", city: "" });
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Agents</h1>
          <p className="text-sm text-muted-foreground">Attorneys and field agents used in applications.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="size-4 mr-2" />New Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Agent" : "New Agent"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Agents ({agents.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents yet. Add your first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>City</TableHead><TableHead>Address</TableHead><TableHead className="w-24"></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.city || "—"}</TableCell>
                    <TableCell>{a.address || "—"}</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Delete ${a.name}?`)) deleteMutation.mutate(a.id); }}><Trash2 className="size-4" /></Button>
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
