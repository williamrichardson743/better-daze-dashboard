import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemo } from "react";

function MiniBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Analytics() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: cycles } = trpc.dashboard.cycles.useQuery();
  const { data: products } = trpc.dashboard.products.useQuery();
  const { data: orders } = trpc.dashboard.recentOrders.useQuery();
  const { data: socialAccounts } = trpc.dashboard.socialAccounts.useQuery();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const formatNumber = (val: number) => new Intl.NumberFormat("en-US").format(val);

  const revenueByCycle = useMemo(() => {
    return cycles?.map((c) => ({
      name: c.name || `Cycle ${c.cycleNumber}`,
      revenue: parseFloat(c.actualRevenue || "0"),
      target: parseFloat(c.targetRevenue || "0"),
    })) || [];
  }, [cycles]);

  const maxRevenue = Math.max(...revenueByCycle.map((r) => r.target || 1), 1);

  const productPerformance = useMemo(() => {
    return products
      ?.map((p) => ({
        name: p.name,
        sales: p.salesCount || 0,
        revenue: parseFloat(p.price || "0") * (p.salesCount || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [products]);

  const maxProductRevenue = Math.max(...(productPerformance?.map((p) => p.revenue) || [1]), 1);

  const orderStatusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    orders?.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      pct: orders?.length ? (count / orders.length) * 100 : 0,
    }));
  }, [orders]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Deep insights into your POD business performance.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12.5% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats?.orders?.total || 0)}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+8.3% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">3.2%</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <ArrowDownRight className="h-3 w-3" />
                <span>-0.4% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <Package className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  stats?.orders?.total
                    ? (stats.orders.totalRevenue || 0) / stats.orders.total
                    : 0
                )}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+5.1% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by Cycle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by Cycle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {revenueByCycle.map((cycle) => (
                <div key={cycle.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cycle.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(cycle.revenue)} / {formatCurrency(cycle.target)}
                    </span>
                  </div>
                  <MiniBar value={cycle.revenue} max={maxRevenue} />
                </div>
              ))}
              {revenueByCycle.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No cycle data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productPerformance?.map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(product.revenue)} ({product.sales} sales)
                    </span>
                  </div>
                  <MiniBar value={product.revenue} max={maxProductRevenue} color="bg-accent" />
                </div>
              ))}
              {(!productPerformance || productPerformance.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No product data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderStatusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center gap-4">
                  <Badge variant="outline" className="text-[10px] capitalize w-20 justify-center">
                    {item.status}
                  </Badge>
                  <div className="flex-1">
                    <MiniBar value={item.count} max={orders?.length || 1} color="bg-green-500" />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              ))}
              {orderStatusBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No order data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Social Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Presence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialAccounts?.map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{account.accountHandle}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNumber(account.followerCount || 0)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>+2.4%</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!socialAccounts || socialAccounts.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No social accounts connected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
