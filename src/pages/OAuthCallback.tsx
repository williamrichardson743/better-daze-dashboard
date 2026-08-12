import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch("https://backboard.railway.app/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: `${window.location.origin}/api/oauth/callback`,
            client_id: import.meta.env.VITE_APP_ID,
            client_secret: import.meta.env.VITE_APP_SECRET,
          }),
        });

        const data = await res.json();

        if (!data.access_token) {
          setError("Authentication failed. Please try again.");
          return;
        }

        // Store token in localStorage
        localStorage.setItem("bd_token", data.access_token);

        // Redirect to app
        navigate("/app", { replace: true });
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    };

    exchangeToken();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-destructive">{error}</p>
          <a href="/login" className="text-sm text-primary underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
