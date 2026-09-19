import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Package, Truck, DollarSign, Clock } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  paid: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "secondary",
  cancelled: "destructive",
  refunded: "outline",
};

const fulfillmentColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  unfulfilled: "outline",
  pending: "secondary",
  fulfilled: "default",
  partial: "secondary",
  returned: "destructive",
};

export default function SellerOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.shop.sellerOrders.useQuery();
  const { data: credentials } = trpc.operations.credentials.list.useQuery();
  const upsertCredential = trpc.operations.credentials.upsert.useMutation({
    onSuccess: () => {
      utils.operations.credentials.list.invalidate();
      toast.success("Printful credential saved");
      setPrintfulOpen(false);
      setPrintfulToken("");
    },
    onError: (err) => toast.error(err.message),
  });
  const [printfulOpen, setPrintfulOpen] = useState(false);
  const [printfulToken, setPrintfulToken] = useState("");
  const printfulConnected = credentials?.some((c) => c.serviceName === "printful" && c.status === "active");

  const stats = {
    total: orders?.length || 0,
    unfulfilled: orders?.filter((o) => o.fulfillmentStatus === "unfulfilled").length || 0,
    revenue: orders?.reduce((sum, o) => sum + parseFloat(o.total || "0"), 0) || 0,
    shipped: orders?.filter((o) => o.status === "shipped").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders & Fulfillment</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer orders, fulfillment status, and shipping.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPrintfulOpen(true)}>
            <Truck className="mr-2 h-4 w-4" />
            {printfulConnected ? "Printful Connected" : "Connect Printful"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Orders</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Unfulfilled</span>
              </div>
              <p className="text-2xl font-bold">{stats.unfulfilled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.revenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Shipped</span>
              </div>
              <p className="text-2xl font-bold">{stats.shipped}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.customerName || order.email}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[order.status] || "outline"} className="text-[10px] capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={fulfillmentColors[order.fulfillmentStatus] || "outline"} className="text-[10px] capitalize">
                          {order.fulfillmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${parseFloat(order.total || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Dialog open={printfulOpen} onOpenChange={setPrintfulOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Printful</DialogTitle>
              <DialogDescription>Enter your Printful API token to enable fulfillment sync.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Printful API Token</Label>
                <Input type="password" placeholder="paste your token here" value={printfulToken} onChange={(e) => setPrintfulToken(e.target.value)} />
                <p className="text-xs text-muted-foreground">Find this at printful.com/dashboard/developer/api</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrintfulOpen(false)}>Cancel</Button>
              <Button
                disabled={!printfulToken || upsertCredential.isPending}
                onClick={() => upsertCredential.mutate({
                  serviceName: "printful",
                  displayName: "Printful",
                  userId: 1,
                  status: "active",
                  metadata: { hasToken: true },
                })}
              >
                {upsertCredential.isPending ? "Saving..." : "Save Connection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
