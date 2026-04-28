import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShoppingBag, Sparkles, Star } from "lucide-react";

function ProductCard({ product }: { product: any }) {
  const primaryImage = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];
  const allSizes = [...new Set(product.variants?.map((v: any) => v.size).filter(Boolean))];

  return (
    <Card className="group overflow-hidden border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
      <Link to={`/shop/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{product.productType}</p>
          </div>
          <span className="text-sm font-bold shrink-0">
            ${parseFloat(product.price || "0").toFixed(2)}
          </span>
        </div>
        {allSizes.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1.5">
            Sizes: {allSizes.join(", ")}
          </p>
        )}
        <div className="flex gap-1 mt-2">
          {product.variants?.slice(0, 4).map((v: any) => (
            <div
              key={v.id}
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: v.colorHex || "#ccc" }}
              title={v.color}
            />
          ))}
        </div>
        <Button
          className="w-full mt-3 h-8 text-xs"
          size="sm"
          onClick={() => {
            const cart = JSON.parse(localStorage.getItem("bd-cart") || "[]");
            const existing = cart.find((i: any) => i.productId === product.id && !i.variantId);
            if (existing) {
              existing.quantity += 1;
            } else {
              cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: primaryImage?.url || "",
                variantId: product.variants?.[0]?.id,
                variantName: product.variants?.[0] ? `${product.variants[0].size} / ${product.variants[0].color}` : undefined,
                quantity: 1,
              });
            }
            localStorage.setItem("bd-cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cart-updated"));
            toast.success("Added to cart!");
          }}
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}

export default function Shop() {
  const { data: products, isLoading } = trpc.shop.products.useQuery();
  const { data: collections } = trpc.shop.collections.useQuery();

  return (
    <div className="space-y-8 py-8">
      {/* Hero Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-primary/20 p-8 sm:p-12">
          <div className="relative max-w-xl">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              New Drop
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Better Daze Collection
            </h1>
            <p className="mt-3 text-muted-foreground">
              Premium print-on-demand apparel designed for creators. Each piece tells a story.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 (128 reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collections */}
      {collections && collections.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/shop">All</Link>
            </Button>
            {collections.map((col) => (
              <Button key={col.id} variant="outline" size="sm" asChild>
                <Link to={`/shop/collections/${col.slug}`}>{col.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Products</h2>
          <span className="text-sm text-muted-foreground">
            {products?.length || 0} items
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {(!products || products.length === 0) && (
              <div className="col-span-full text-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
