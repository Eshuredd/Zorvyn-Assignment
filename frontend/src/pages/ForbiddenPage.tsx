import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="font-mono text-[64px] font-semibold leading-none tracking-[-0.08em] text-black/15">403</div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">Access Denied</h1>
      <p className="mt-2 max-w-[320px] text-sm text-muted-foreground">
        Your current role (<strong className="text-foreground">{user?.role}</strong>) does not have permission to view this
        page.
      </p>
      <Button variant="outline" className="mt-6 rounded-md border-border" onClick={() => navigate("/")}>
        ← Back to Dashboard
      </Button>
    </div>
  );
}
