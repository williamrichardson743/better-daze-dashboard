import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CreditCard,
  Crown,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

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
    limits: { cycles: 3, products: 20, social: 2 },
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
    limits: { cycles: 10, products: Infinity, social: 10 },
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
    limits: { cycles: Infinity, products: Infinity, social: Infinity },
  },
];

function BillingCard({
  plan,
  current,
  onUpgrade,
  loading,
}: {
  plan: (typeof plans)[0];
  current: boolean;
  onUpgrade: () => void;
  loading: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden ${plan.id === "growth" ? "border-primary shadow-lg" : ""}`}>
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
          variant={current ? "secondary" : plan.id === "growth" ? "default" : "outline"}
          disabled={current || loading}
          onClick={onUpgrade}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : current ? "Current Plan" : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Billing() {
  const utils = trpc.useUtils();
  const { data: subscription } = trpc.billing.getSubscription.useQuery();
  const createCheckout = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });
  const cancelSub = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      utils.billing.getSubscription.invalidate();
      toast.success("Subscription cancelled");
    },
  });
  const portalSession = trpc.billing.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const [annual, setAnnual] = useState(false);
  const discount = 0.2;

  const currentPlan = subscription?.plan || "starter";
  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Manage your plan, payment methods, and billing history.
          </p>
        </div>

        {/* Current Plan Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                  <Crown className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold capitalize">{currentPlan} Plan</h2>
                    <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                      {subscription?.status || "active"}
                    </Badge>
                    {subscription?.cancelAtPeriodEnd && (
                      <Badge variant="destructive" className="text-[10px]">
                        Cancels soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.currentPeriodEnd
                      ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : "Free trial active"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => portalSession.mutate()}
                    disabled={portalSession.isPending}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Manage
                  </Button>
                )}
                {isActive && !subscription?.cancelAtPeriodEnd && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelSub.mutate()}
                    disabled={cancelSub.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span className={`text-sm ${annual ? "font-medium" : "text-muted-foreground"}`}>
            Annual
          </span>
          {annual && (
            <Badge variant="secondary" className="text-[10px] text-green-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              Save 20%
            </Badge>
          )}
        </div>

        {/* Plans */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <BillingCard
              key={plan.id}
              plan={{
                ...plan,
                price: annual ? Math.round(plan.price * 12 * (1 - discount) / 12) : plan.price,
              }}
              current={currentPlan === plan.id}
              onUpgrade={() => createCheckout.mutate({ plan: plan.id as any })}
              loading={createCheckout.isPending}
            />
          ))}
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/27</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Default</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => portalSession.mutate()}>
              Update Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { date: "Apr 15, 2026", amount: 79, status: "paid", plan: "Growth" },
                { date: "Mar 15, 2026", amount: 79, status: "paid", plan: "Growth" },
                { date: "Feb 15, 2026", amount: 29, status: "paid", plan: "Starter" },
              ].map((invoice) => (
                <div
                  key={invoice.date}
                  className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invoice.plan} Plan</p>
                      <p className="text-xs text-muted-foreground">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${invoice.amount}.00</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
