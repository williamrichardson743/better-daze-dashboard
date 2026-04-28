import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, Lock, CreditCard, Loader2 } from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: string;
  image: string;
  variantId?: number;
  variantName?: string;
  quantity: number;
}

export default function Checkout() {
  const [cart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem("bd-cart") || "[]"));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "US" });
  const [loading, setLoading] = useState(false);

  const createOrder = trpc.shop.createOrder.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("bd-last-order", JSON.stringify(data));
      localStorage.removeItem("bd-cart");
      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = `/shop/order-success?order=${data.orderNumber}`;
    },
    onError: (err) => {
      toast.error(err.message);
      setLoading(false);
    },
  });

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !address.line1 || !address.city || !address.state || !address.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLoading(true);
    createOrder.mutate({
      email,
      customerName: name,
      phone,
      items: cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: address,
      subtotal,
      shipping,
      tax,
      total,
    });
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 gap-2" asChild>
        <Link to="/shop/cart">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid gap-3">
              <Input
                placeholder="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="grid gap-3">
              <Input
                placeholder="Address line 1 *"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                required
              />
              <Input
                placeholder="Address line 2 (apt, suite, etc.)"
                value={address.line2}
                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                />
                <Input
                  placeholder="State / Province *"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Postal Code *"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  required
                />
                <Input
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <Card className="p-4 border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm">
                  Payment will be processed securely via Stripe after order placement.
                </span>
              </div>
            </Card>
          </div>

          <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Complete Order — ${total.toFixed(2)}
              </>
            )}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="p-5 sticky top-24">
            <h2 className="text-sm font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-muted-foreground m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[10px] text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium shrink-0">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
