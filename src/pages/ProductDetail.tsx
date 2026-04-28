import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft, CheckCircle2, Truck, Shield, Heart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = trpc.shop.productById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button className="mt-4" asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];
  const sizes = [...new Set(variants.map((v: any) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))];

  const currentVariant = selectedVariant || variants[0];
  const currentPrice = currentVariant ? currentVariant.price : product.price;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("bd-cart") || "[]");
    const variantId = currentVariant?.id;
    const existing = cart.find(
      (i: any) => i.productId === product.id && i.variantId === variantId
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: currentPrice,
        image: images[selectedImage]?.url || images[0]?.url || "",
        variantId,
        variantName: currentVariant
          ? `${currentVariant.size}${currentVariant.color ? ` / ${currentVariant.color}` : ""}`
          : undefined,
        quantity,
      });
    }
    localStorage.setItem("bd-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 gap-2" asChild>
        <Link to="/shop">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage].url}
                alt={images[selectedImage].alt || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 rounded-lg border overflow-hidden ${
                    selectedImage === i ? "border-primary ring-1 ring-primary" : "border-border"
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] capitalize">
                {product.productType}
              </Badge>
              {product.slogan && (
                <Badge variant="secondary" className="text-[10px]">
                  {product.slogan}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ${parseFloat(currentPrice || "0").toFixed(2)}
            </span>
            {product.cost && (
              <span className="text-sm text-muted-foreground">
                ${parseFloat(product.cost).toFixed(2)} production cost
              </span>
            )}
          </div>

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => {
                      const v = variants.find((va: any) => va.size === size && (selectedVariant ? va.color === selectedVariant.color : true));
                      if (v) setSelectedVariant(v);
                    }}
                    className={`h-10 min-w-[3rem] rounded-lg border px-3 text-sm font-medium transition-colors ${
                      currentVariant?.size === size
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color: string) => {
                  const variant = variants.find((v: any) => v.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        const v = variants.find((va: any) => va.color === color && (selectedVariant ? va.size === selectedVariant.size : true));
                        if (v) setSelectedVariant(v);
                      }}
                      className={`flex items-center gap-2 h-10 rounded-lg border px-3 text-sm transition-colors ${
                        currentVariant?.color === color
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: variant?.colorHex || "#ccc" }}
                      />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3">
            <Button className="flex-1 h-12 gap-2" onClick={addToCart}>
              <ShoppingBag className="h-5 w-5" />
              Add to Cart — ${(parseFloat(currentPrice || "0") * quantity).toFixed(2)}
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-medium">Free Shipping</span>
              <span className="text-[10px] text-muted-foreground">Over $50</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-medium">Secure Payment</span>
              <span className="text-[10px] text-muted-foreground">SSL Encrypted</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-medium">Quality Guarantee</span>
              <span className="text-[10px] text-muted-foreground">30-day returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
