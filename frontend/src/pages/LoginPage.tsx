import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_ACCOUNTS, type DemoAccountKey } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = login(email, password);
    if (ok) {
      navigate("/", { replace: true });
      return;
    }
    setError("Invalid email or password. Try a demo account below.");
  };

  const fillDemo = (key: DemoAccountKey) => {
    const acc = DEMO_ACCOUNTS[key];
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background p-8">
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-1 flex items-center gap-2 text-[18px] font-semibold tracking-tight text-primary">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          FinLedger
        </div>
        <h1 className="mb-1 mt-6 text-[22px] font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="mb-8 text-[13px] text-muted-foreground">Finance data & access control platform</p>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="auth-form-label">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@finco.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border-border bg-card px-3 focus-visible:border-primary focus-visible:ring-primary/15"
            />
          </div>
          <div>
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-md border-border bg-card px-3 focus-visible:border-primary focus-visible:ring-primary/15"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-md bg-primary font-medium text-primary-foreground hover:bg-[#154d3a]"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 rounded-md bg-secondary p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Demo accounts — click to auto-fill
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(["admin", "analyst", "viewer"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => fillDemo(key)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
