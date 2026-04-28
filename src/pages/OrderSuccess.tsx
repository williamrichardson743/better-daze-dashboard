import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Truck, Home, ArrowRight } from "lucide-react";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. We've sent a confirmation email.
      </p>

      {orderNumber && (
        <Card className="p-6 mb-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-lg font-bold font-mono">{orderNumber}</p>
            </div>
            <Badge variant="secondary">Confirmed</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Order Processing</p>
                <p className="text-xs text-muted-foreground">Your order is being prepared</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Shipped</p>
                <p className="text-xs text-muted-foreground">You'll receive tracking info soon</p>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Home className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-xs text-muted-foreground">Estimated 5-7 business days</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to={`/shop/track?order=${orderNumber}`}>
            Track Order
          </Link>
        </Button>
        <Button className="gap-2" asChild>
          <Link to="/shop">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
