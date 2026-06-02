import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function makeStub(title: string, blurb: string) {
  return function StubPage() {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{blurb}</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Coming next</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This module is scaffolded. The schema and access rules are in place; the UI will be built next.
          </CardContent>
        </Card>
      </div>
    );
  };
}

export { makeStub };
