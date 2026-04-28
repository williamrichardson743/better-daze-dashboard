import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShoppingBag,
  Plus,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Image,
} from "lucide-react";
import { useState } from "react";

export default function Products() {
  const { data: products } = trpc.dashboard.products.useQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const formatCurrency = (val: string | null) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val || "0"));

  const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    draft: "outline",
    pending: "secondary",
    approved: "default",
    live: "default",
    sold_out: "destructive",
    discontinued: "outline",
  };

  const totalRevenue = products?.reduce((sum, p) => sum + parseFloat(p.price || "0") * (p.salesCount || 0), 0) || 0;
  const totalCost = products?.reduce((sum, p) => sum + parseFloat(p.cost || "0") * (p.salesCount || 0), 0) || 0;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your POD product catalog and inventory.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>Add a new product to your catalog.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input placeholder="e.g. Sunset Dreams Tee" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <Input type="number" placeholder="34.99" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cost</label>
                    <Input type="number" placeholder="12.50" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success("Product added!"); setCreateOpen(false); }}>
                  Add Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Products</span>
              </div>
              <p className="text-2xl font-bold">{products?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
              <p className="text-2xl font-bold">{products?.filter((p) => p.status === "live").length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(String(totalRevenue))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Profit Margin</span>
              </div>
              <p className="text-2xl font-bold">{margin.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Inventory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Image className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{product.productType}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[product.status] || "outline"} className="text-[10px] capitalize">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{product.salesCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <Progress
                          value={product.inventory ? Math.min((product.inventory / 100) * 100, 100) : 0}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs w-8 text-right">{product.inventory || 0}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!products || products.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products yet. Add your first product!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
