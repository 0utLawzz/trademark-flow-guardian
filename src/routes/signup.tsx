import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Trademark MS account" },
      { name: "description", content: "Create an internal team account to access the Trademark MS workspace for managing IP cases, payments, agents and Drive folders." },
      { property: "og:title", content: "Create your Trademark MS account" },
      { property: "og:description", content: "Internal team account signup for the Trademark MS IP case management workspace." },
      { property: "og:url", content: "https://brandxv1.lovable.app/signup" },
    ],
    links: [{ rel: "canonical", href: "https://brandxv1.lovable.app/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. You can sign in now.");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-secondary/40 to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Trademark MS</p>
            <p className="text-xs text-muted-foreground">IP case management</p>
          </div>
        </div>
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <h1 className="font-display text-2xl font-semibold leading-none tracking-tight">Create your account</h1>
            <CardDescription>Internal team access only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
