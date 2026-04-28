import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus } from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: string;
  image: string;
  variantId?: number;
  variantName?: string;
  quantity: number;
}

function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const load = () => setCart(JSON.parse(localStorage.getItem("bd-cart") || "[]"));
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, []);

  const save = (newCart: CartItem[]) => {
    localStorage.setItem("bd-cart", JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const updateQty = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    save(newCart);
  };

  const remove = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    save(newCart);
    toast.success("Item removed");
  };

  const clear = () => {
    save([]);
    toast.success("Cart cleared");
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return { cart, updateQty, remove, clear, subtotal, shipping, tax, total };
}

export default function Cart() {
  const { cart, updateQty, remove, clear, subtotal, shipping, tax, total } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <Card key={`${item.productId}-${item.variantId}`} className="p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-muted-foreground m-auto" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                    )}
                    <p className="text-sm font-semibold mt-1">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(i, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(i, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-red-600" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={clear}>
              Clear Cart
            </Button>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-4">Order Summary</h2>
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
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {shipping > 0 && subtotal < 50 && (
                  <p className="text-[11px] text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-4 gap-2" asChild>
                <Link to="/shop/checkout">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
