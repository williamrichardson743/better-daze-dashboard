import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Users,
  Crown,
  Shield,
  Eye,
  Mail,
  Plus,
  DollarSign,
  Activity,
} from "lucide-react";

export default function Team() {
  const { data: users } = trpc.admin.users.list.useQuery();

  const roleConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    admin: { icon: <Crown className="h-3 w-3" />, color: "bg-primary text-primary-foreground", label: "Admin" },
    user: { icon: <Shield className="h-3 w-3" />, color: "bg-secondary text-secondary-foreground", label: "User" },
    viewer: { icon: <Eye className="h-3 w-3" />, color: "bg-muted text-muted-foreground", label: "Viewer" },
  };

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u) => u.role === "admin").length || 0,
    active: users?.filter((u) => u.status === "active").length || 0,
    revenue: "$45.2K",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground">
              Manage team members, roles, and permissions.
            </p>
          </div>
          <Button className="gap-2" onClick={() => toast.success("Invite feature coming soon!")}>
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Members</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Admins</span>
              </div>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Active Now</span>
              </div>
              <p className="text-2xl font-bold">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Team Revenue</span>
              </div>
              <p className="text-2xl font-bold">{stats.revenue}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Team Members List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users?.map((user) => {
                const cfg = roleConfig[user.role] || roleConfig.user;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name || "Unnamed"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email || "No email"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[10px] gap-1 ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      <Badge
                        variant={user.status === "active" ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {user.status || "active"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {(!users || users.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No team members yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["admin", "user", "viewer"].map((role) => {
                const count = users?.filter((u) => u.role === role).length || 0;
                const total = users?.length || 1;
                const cfg = roleConfig[role];
                return (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cfg.color.replace("bg-", "text-")}>{cfg.icon}</span>
                        <span className="capitalize font-medium">{cfg.label}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {count} ({Math.round((count / total) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(count / total) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
