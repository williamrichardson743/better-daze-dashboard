import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Settings,
  Users,
  ShoppingBag,
  RotateCcw,
  Megaphone,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  CreditCard,
  Wand2,
  Rocket,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Design Studio", href: "/app/design-studio", icon: Wand2 },
  { name: "Cycles", href: "/app/cycles", icon: RotateCcw },
  { name: "Campaigns", href: "/app/campaigns", icon: Rocket },
  { name: "Products", href: "/app/products", icon: ShoppingBag },
  { name: "Marketing", href: "/app/marketing", icon: Megaphone },
  { name: "Orders", href: "/app/orders", icon: Package },
  { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { name: "Team", href: "/app/team", icon: Users },
  { name: "Billing", href: "/app/billing", icon: CreditCard },
];

const adminNavigation = [
  { name: "Admin Settings", href: "/app/admin", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading Better Daze...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none tracking-tight">Better Daze</span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Narrative Division</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Main
            </p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="mt-6 space-y-1">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Administration
              </p>
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{user.name || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email || ""}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="shrink-0">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {user.role}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {user.status || "active"}
            </Badge>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <Sparkles className="mr-1 h-3 w-3" />
              POD Dashboard
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
