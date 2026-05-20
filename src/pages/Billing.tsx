import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Store,
  Crown,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  CreditCard,
} from "lucide-react";

const SHOPIFY_STORE_URL = "https://xe1y5t-hx.myshopify.com";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for solo creators getting started with POD.",
    features: [
      "3 active cycles",
      "20 products per cycle",
      "Basic analytics",
      "2 social accounts",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "For growing brands scaling their merchandise.",
    features: [
      "10 active cycles",
      "Unlimited products",
      "Advanced analytics",
      "10 social accounts",
      "Priority support",
      "Team collaboration",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "For established brands with complex operations.",
    features: [
      "Unlimited cycles",
      "Unlimited products",
      "Custom analytics",
      "Unlimited social accounts",
      "Dedicated support",
      "SSO & advanced security",
      "Custom integrations",
      "White-label options",
    ],
  },
];

export default function Billing() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Payments powered by Shopify Payments. Manage your plan and view order revenue.
          </p>
        </div>

        {/* Shopify Payments Banner */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Shopify Payments</h2>
                  <p className="text-sm text-muted-foreground">
                    All payments processed securely through Shopify
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${SHOPIFY_STORE_URL}/admin/settings/payments`, "_blank")}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Manage Payments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Store</span>
              </div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Products live</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <p className="text-2xl font-bold">$0</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Fees</span>
              </div>
              <p className="text-2xl font-bold">2.9%</p>
              <p className="text-xs text-muted-foreground">+ 30¢ per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Platform Plans</h2>
          <Badge variant="outline" className="text-[10px]">Manage via Shopify</Badge>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${plan.id === "growth" ? "border-primary shadow-lg" : ""}`}
            >
              {plan.id === "growth" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.id === "growth" ? "default" : "outline"}
                  onClick={() => {
                    toast.info("Contact Will to upgrade your plan");
                  }}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shopify Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shopify Admin Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Payments Dashboard", url: `${SHOPIFY_STORE_URL}/admin/settings/payments` },
              { label: "Orders", url: `${SHOPIFY_STORE_URL}/admin/orders` },
              { label: "Products", url: `${SHOPIFY_STORE_URL}/admin/products` },
              { label: "Analytics", url: `${SHOPIFY_STORE_URL}/admin/reports` },
            ].map((link) => (
              <div
                key={link.label}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => window.open(link.url, "_blank")}
              >
                <span className="text-sm font-medium">{link.label}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
