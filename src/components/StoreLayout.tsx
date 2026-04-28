import { Outlet, Link } from "react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User,
  ArrowRight,
} from "lucide-react";

function useCartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("bd-cart") || "[]");
    setCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    const onStorage = () => {
      const c = JSON.parse(localStorage.getItem("bd-cart") || "[]");
      setCount(c.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart-updated", onStorage);
    };
  }, []);
  return count;
}

export default function StoreLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-border shadow-sm"
            : "bg-background border-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/shop" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">Better Daze</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link to="/shop/collections/summer-vibes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Summer
              </Link>
              <Link to="/shop/collections/urban-nightlife" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Urban
              </Link>
              <Link to="/shop/collections/natures-echo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Nature
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/shop/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Link>
              <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                <Link to="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link to="/shop" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              <Link to="/shop/collections/summer-vibes" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Summer Vibes</Link>
              <Link to="/shop/collections/urban-nightlife" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Urban Nightlife</Link>
              <Link to="/shop/collections/natures-echo" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Nature's Echo</Link>
              <Link to="/shop/cart" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">Better Daze</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Premium print-on-demand apparel and accessories for creators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/shop" className="hover:text-foreground">All Products</Link></li>
                <li><Link to="/shop/collections/summer-vibes" className="hover:text-foreground">Summer Vibes</Link></li>
                <li><Link to="/shop/collections/urban-nightlife" className="hover:text-foreground">Urban Nightlife</Link></li>
                <li><Link to="/shop/collections/natures-echo" className="hover:text-foreground">Nature's Echo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/shop/track" className="hover:text-foreground">Track Order</Link></li>
                <li><Link to="/login" className="hover:text-foreground">Seller Dashboard</Link></li>
                <li><a href="#" className="hover:text-foreground">Shipping Info</a></li>
                <li><a href="#" className="hover:text-foreground">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Stay Updated</h4>
              <div className="flex gap-2">
                <Input placeholder="Enter email" className="h-9 text-sm" />
                <Button size="sm" className="h-9 px-3">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 Better Daze Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
