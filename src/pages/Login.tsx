import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

function getOAuthUrl() {
  const authUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(authUrl);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading Better Daze...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card/50 backdrop-blur-sm border-r border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Better Daze</h1>
            <p className="text-xs text-muted-foreground">Official Narrative Division</p>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Print-on-Demand
            <br />
            <span className="text-primary">Made Simple.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            Design, produce, and sell custom merchandise with our all-in-one operations dashboard.
          </p>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 rounded-lg border bg-background/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Lightning Fast Cycles</p>
                <p className="text-xs text-muted-foreground">From idea to product in days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-background/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Enterprise Security</p>
                <p className="text-xs text-muted-foreground">Role-based access control</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-background/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Revenue Analytics</p>
                <p className="text-xs text-muted-foreground">Real-time sales insights</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2026 Better Daze. All rights reserved.
        </p>
      </div>

      {/* Right side - Login */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-12">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Better Daze</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to access your Operations Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-11 gap-2 text-sm"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              Continue with SSO
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Secure OAuth 2.0</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
