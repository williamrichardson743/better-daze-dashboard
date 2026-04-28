// @ts-nocheck
import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle2, Clock, Search, ArrowLeft, ShoppingBag } from "lucide-react";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", icon: <Clock className="h-4 w-4" />, color: "bg-amber-50 text-amber-600" },
  paid: { label: "Paid", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-blue-50 text-blue-600" },
  processing: { label: "Processing", icon: <Package className="h-4 w-4" />, color: "bg-purple-50 text-purple-600" },
  shipped: { label: "Shipped", icon: <Truck className="h-4 w-4" />, color: "bg-green-50 text-green-600" },
  delivered: { label: "Delivered", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-green-50 text-green-600" },
  cancelled: { label: "Cancelled", icon: <Clock className="h-4 w-4" />, color: "bg-red-50 text-red-600" },
};

// Separate component for items to avoid tRPC type inference issues
function OrderItemRow({ item }: { item: any }) {
  return (
    <div className="flex gap-3">
      <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-5 w-5 text-muted-foreground m-auto" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{item.productName}</p>
        {item.variantName && (
          <p className="text-xs text-muted-foreground">{item.variantName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Qty: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
        </p>
      </div>
      <p className="text-sm font-medium shrink-0">
        ${parseFloat(item.totalPrice).toFixed(2)}
      </p>
    </div>
  );
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);

  const { data, isLoading } = trpc.shop.trackOrder.useQuery(
    { orderNumber },
    { enabled: searched && orderNumber.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const order = data?.order;
  const items = (data?.items || []) as any[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 gap-2" asChild>
        <Link to="/shop">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          placeholder="Enter order number (e.g. BD-A1B2C3)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Track
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">Loading order...</div>
      )}

      {searched && !isLoading && !order && (
        <div className="text-center py-8">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Order not found. Please check your order number.</p>
        </div>
      )}

      {order && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Order</p>
              <p className="text-xl font-bold font-mono">{order.orderNumber}</p>
            </div>
            <Badge
              className={`gap-1 ${statusConfig[order.status]?.color || "bg-muted"}`}
              variant="outline"
            >
              {statusConfig[order.status]?.icon}
              {statusConfig[order.status]?.label || order.status}
            </Badge>
          </div>

          {/* Timeline */}
          <div className="space-y-0 mb-6">
            {["pending", "paid", "processing", "shipped", "delivered"].map((step, i) => {
              const isActive = ["pending", "paid", "processing", "shipped", "delivered"].indexOf(order.status) >= i;
              const isCurrent = order.status === step;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {i + 1}
                    </div>
                    {i < 4 && (
                      <div className={`w-0.5 h-6 ${isActive ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium capitalize ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step === "pending" ? "Order Placed" : step === "paid" ? "Payment Confirmed" : step}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <h3 className="text-sm font-semibold mb-3">Items</h3>
          <div className="space-y-3">
            {items.map((item: any) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Shipping */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-muted-foreground">
                {order.customerName}
                <br />
                {(order.shippingAddress as any).line1}
                {(order.shippingAddress as any).line2 && <><br />{(order.shippingAddress as any).line2}</>}
                <br />
                {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).postalCode}
                <br />
                {(order.shippingAddress as any).country}
              </p>
            </div>
          )}

          {order.trackingNumber && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">Tracking Number</p>
              <p className="text-sm text-green-700 font-mono">{order.trackingNumber}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
