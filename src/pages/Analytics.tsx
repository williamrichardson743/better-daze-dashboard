import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useMemo } from "react";

const COLORS = ["hsl(262 56% 58%)", "hsl(24 95% 53%)", "hsl(142 76% 36%)", "hsl(38 92% 50%)", "hsl(217 91% 60%)"];

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

  // Revenue chart data
  const revenueData = useMemo(() => {
    return [
      { name: "Jan", revenue: 4200, target: 5000 },
      { name: "Feb", revenue: 3800, target: 5000 },
      { name: "Mar", revenue: 5600, target: 6000 },
      { name: "Apr", revenue: 7240, target: 7000 },
      { name: "May", revenue: 3450, target: 8000 },
      { name: "Jun", revenue: 2100, target: 6000 },
    ];
  }, []);

  // Revenue by Cycle
  const cycleRevenueData = useMemo(() => {
    return cycles?.map((c) => ({
      name: c.name?.slice(0, 12) || `C${c.cycleNumber}`,
      revenue: parseFloat(c.actualRevenue || "0"),
      target: parseFloat(c.targetRevenue || "0"),
    })) || [];
  }, [cycles]);

  // Product performance
  const productPerformance = useMemo(() => {
    return products
      ?.map((p) => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
        sales: p.salesCount || 0,
        revenue: parseFloat(p.price || "0") * (p.salesCount || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [products]);

  // Order status breakdown
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders?.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [orders]);

  // Social followers data
  const socialData = useMemo(() => {
    return socialAccounts?.map((account) => ({
      name: account.platform,
      followers: account.followerCount || 0,
    })) || [];
  }, [socialAccounts]);

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

        <Tabs defaultValue="revenue">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(262 56% 58%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(262 56% 58%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(262 56% 58%)" fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="target" stroke="hsl(24 95% 53%)" strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycleRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="revenue" fill="hsl(262 56% 58%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance?.map((product, i) => (
                    <div key={product.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatCurrency(product.revenue)} ({product.sales} sales)
                        </span>
                      </div>
                      <MiniBar
                        value={product.revenue}
                        max={Math.max(...(productPerformance?.map((p) => p.revenue) || [1]))}
                        color={i === 0 ? "bg-primary" : "bg-primary/60"}
                      />
                    </div>
                  ))}
                  {(!productPerformance || productPerformance.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No product data yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {orderStatusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {orderStatusData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs capitalize">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders?.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.quantity} × {formatCurrency(parseFloat(order.unitPrice || "0"))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(parseFloat(order.totalRevenue || "0"))}</p>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={socialData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="followers" fill="hsl(262 56% 58%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Presence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialAccounts?.map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
