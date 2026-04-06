import { LayoutDashboard, List, BarChart3, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { hasAccess } = useAuth();

  const mobileItems = [
    { title: "Home", url: "/", icon: LayoutDashboard, minRole: "Viewer" as const },
    { title: "Records", url: "/transactions", icon: List, minRole: "Viewer" as const },
    { title: "Analytics", url: "/analytics", icon: BarChart3, minRole: "Analyst" as const },
    { title: "Users", url: "/users", icon: Users, minRole: "Admin" as const },
  ].filter((i) => hasAccess(i.minRole));

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:ml-[220px] md:pb-0">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 z-[90] flex items-center justify-around border-t border-border/80 bg-card px-1 py-2 md:hidden">
        {mobileItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] text-muted-foreground",
            )}
            activeClassName="font-medium text-primary"
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
