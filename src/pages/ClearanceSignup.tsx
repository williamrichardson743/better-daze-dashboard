import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ClearanceSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const join = trpc.waitlist.join.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Better Daze Division
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Clearance is not automatic
          </h1>
          <p className="text-sm text-muted-foreground">
            Field Issue 001 distributes soon. Registered personnel get first
            access. Unregistered personnel do not.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-border p-6 space-y-2">
            <p className="font-mono text-sm tracking-wide">STATUS: PENDING</p>
            <p className="text-sm text-muted-foreground">
              Your request for Field Issue clearance has been logged.
              Division correspondence will resume when distribution opens.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              join.mutate({ email, source: "clearance-landing" });
            }}
            className="flex flex-col gap-3"
          >
            <Input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={join.isPending}
            />
            <Button type="submit" disabled={join.isPending}>
              {join.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Clearance
            </Button>
            <p className="text-xs text-muted-foreground">
              No spam. Division correspondence only, and only when it matters.
            </p>
          </form>
        )}

        <Link to="/" className="block text-xs text-muted-foreground hover:text-foreground underline">
          Return to base
        </Link>
      </div>
    </div>
  );
}
