import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingBag,
  RotateCcw,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Instagram,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router";

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                changeType === "positive"
                  ? "text-green-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : changeType === "negative" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : null}
              {change}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "info" | "error";
}) {
  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    info: Clock,
    error: AlertCircle,
  };
  const colors = {
    success: "text-green-600 bg-green-50",
    warning: "text-amber-600 bg-amber-50",
    info: "text-blue-600 bg-blue-50",
    error: "text-red-600 bg-red-50",
  };
  const Icon = icons[type];

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: cycles } = trpc.dashboard.cycles.useQuery();
  const { data: recentOrders } = trpc.dashboard.recentOrders.useQuery();
  const { data: recentLogs } = trpc.dashboard.recentLogs.useQuery();
  const { data: socialAccounts } = trpc.dashboard.socialAccounts.useQuery();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const formatNumber = (val: number) => new Intl.NumberFormat("en-US").format(val);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "Creator"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your POD operations today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            description="Across all active cycles"
          />
          <StatCard
            title="Active Cycles"
            value={String(stats?.cycles?.active || 0)}
            change={`${stats?.cycles?.total || 0} total`}
            changeType="neutral"
            icon={RotateCcw}
            description={`${stats?.cycles?.completed || 0} completed`}
          />
          <StatCard
            title="Products Live"
            value={String(stats?.products?.live || 0)}
            change={`${stats?.products?.totalSales || 0} sales`}
            changeType="positive"
            icon={ShoppingBag}
            description={`${stats?.products?.total || 0} total products`}
          />
          <StatCard
            title="Pending Orders"
            value={String(stats?.orders?.pending || 0)}
            change={`${stats?.orders?.total || 0} total orders`}
            changeType="neutral"
            icon={Package}
            description="Require processing"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cycles */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Active Cycles</CardTitle>
                <Link
                  to="/cycles"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cycles?.map((cycle) => (
                  <div key={cycle.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{cycle.name}</p>
                        <Badge
                          variant={
                            cycle.status === "active"
                              ? "default"
                              : cycle.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {cycle.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{cycle.slogan}</span>
                        <span>·</span>
                        <span className="capitalize">{cycle.currentPhase}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={
                            cycle.targetRevenue
                              ? (parseFloat(cycle.actualRevenue || "0") /
                                  parseFloat(cycle.targetRevenue)) *
                                100
                              : 0
                          }
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs font-medium shrink-0">
                          {formatCurrency(parseFloat(cycle.actualRevenue || "0"))} /{" "}
                          {formatCurrency(parseFloat(cycle.targetRevenue || "0"))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!cycles || cycles.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No cycles yet. Start your first design cycle!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Social Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialAccounts?.map((account) => (
                  <div key={account.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Instagram className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{account.accountHandle}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatNumber(account.followerCount || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">followers</p>
                    </div>
                  </div>
                ))}
                {(!socialAccounts || socialAccounts.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No social accounts connected.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  <Activity className="mr-1 h-3 w-3" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="space-y-1">
                  {recentOrders?.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.quantity} × {formatCurrency(parseFloat(order.unitPrice || "0"))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(parseFloat(order.totalRevenue || "0"))}
                        </p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "secondary"
                              : order.status === "shipped"
                              ? "default"
                              : "outline"
                          }
                          className="text-[10px] mt-1"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!recentOrders || recentOrders.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No orders yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Transmission Log</CardTitle>
                <Link
                  to="/logs"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                <div className="divide-y divide-border">
                  {recentLogs?.map((log) => (
                    <ActivityItem
                      key={log.id}
                      title={log.message}
                      description={`Phase: ${log.phase}`}
                      time={new Date(log.createdAt).toLocaleDateString()}
                      type={
                        log.logType === "success"
                          ? "success"
                          : log.logType === "warning"
                          ? "warning"
                          : log.logType === "error"
                          ? "error"
                          : "info"
                      }
                    />
                  ))}
                  {(!recentLogs || recentLogs.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No activity yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Bar */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Revenue Breakdown</p>
                  <p className="text-xs text-muted-foreground">
                    Cycles: {formatCurrency(stats?.cycles?.totalRevenue || 0)} · Orders:{" "}
                    {formatCurrency(stats?.orders?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold">{formatNumber(stats?.products?.total || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Products</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold">{formatNumber(stats?.orders?.total || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{formatNumber(stats?.products?.totalSales || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Sales</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
