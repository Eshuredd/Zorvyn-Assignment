import { LayoutDashboard, List, BarChart3, Users, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const LogoShield = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} className="fill-white">
    <path d="M8 2L2 5v4c0 3.31 2.24 5.49 6 6.74C11.76 14.49 14 12.31 14 9V5L8 2z" />
  </svg>
);

function avatarToneClass(tone?: string) {
  switch (tone) {
    case "blue":
      return "ledger-avatar-blue";
    case "purple":
      return "ledger-avatar-purple";
    case "orange":
      return "ledger-avatar-orange";
    default:
      return "ledger-avatar-green";
  }
}

export function AppSidebar() {
  const { user, logout, hasAccess } = useAuth();

  const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, minRole: "Viewer" as const },
    { title: "Records", url: "/transactions", icon: List, minRole: "Viewer" as const },
    { title: "Analytics", url: "/analytics", icon: BarChart3, minRole: "Analyst" as const },
    { title: "Users", url: "/users", icon: Users, minRole: "Admin" as const },
  ];

  const visibleItems = navItems.filter((item) => hasAccess(item.minRole));

  const initials =
    user?.name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <aside className="fixed left-0 top-0 z-[100] hidden h-screen w-[220px] flex-col border-r border-border/80 bg-card md:flex">
      <div className="border-b border-border/80 px-5 py-5">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-primary">
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary">
            <LogoShield />
          </div>
          FinLedger
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 border-b border-border/80 px-5 py-3">
          <div className={cn("ledger-avatar", avatarToneClass(user.avatarTone))}>{initials}</div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {user.role.charAt(0).toUpperCase()}
              {user.role.slice(1)}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        <p className="px-5 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Main</p>
        <div className="flex flex-col gap-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 border-l-2 border-transparent py-2 pl-5 pr-4 text-[13px] text-muted-foreground transition-colors select-none hover:bg-secondary hover:text-foreground [&[aria-current=page]_svg]:opacity-100",
              )}
              activeClassName="border-primary bg-primary/10 font-medium text-primary hover:text-primary"
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-70" />
              {item.title}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-border/80 px-5 py-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
