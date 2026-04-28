import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  Megaphone,
  CheckCircle2,
  Star,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <RotateCcw className="h-5 w-5" />,
    title: "Lightning Cycles",
    description: "From idea to live product in under 48 hours with our streamlined design pipeline.",
  },
  {
    icon: <ShoppingBag className="h-5 w-5" />,
    title: "POD Integration",
    description: "One-click publishing to Shopify, Printful, and all major print-on-demand platforms.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Revenue Analytics",
    description: "Real-time profit tracking, margin analysis, and sales forecasting in one view.",
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: "Social Sync",
    description: "Auto-schedule product drops across Instagram, TikTok, Twitter, and more.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Team Security",
    description: "Role-based access control with audit logs and two-factor authentication.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Growth Tools",
    description: "A/B testing for designs, pricing optimization, and inventory alerts.",
  },
];

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for solo creators getting started.",
    features: ["3 active cycles", "20 products", "Basic analytics", "2 social accounts", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: 79,
    description: "For brands scaling their merchandise.",
    features: [
      "10 active cycles",
      "Unlimited products",
      "Advanced analytics",
      "10 social accounts",
      "Priority support",
      "Team collaboration",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    description: "For established brands with complex ops.",
    features: [
      "Unlimited cycles",
      "Unlimited products",
      "Custom analytics",
      "Unlimited social",
      "Dedicated support",
      "SSO & advanced security",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Founder, Drip Culture",
    content:
      "Better Daze cut our product launch time from 2 weeks to 3 days. The revenue analytics alone paid for the subscription in the first month.",
    stars: 5,
  },
  {
    name: "Jordan Chen",
    role: "Creative Director, Hype Studio",
    content:
      "The social sync feature is a game changer. We schedule drops across 5 platforms and watch the numbers roll in from one dashboard.",
    stars: 5,
  },
  {
    name: "Samira Okafor",
    role: "CEO, MerchLab",
    content:
      "We switched from spreadsheets to Better Daze and immediately saw a 40% improvement in team productivity. The role system keeps everyone in their lane.",
    stars: 5,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">Better Daze</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="block text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-xs font-medium">
              <Zap className="mr-1 h-3 w-3" />
              Now with AI-powered design suggestions
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Print-on-Demand
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Made Simple.
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Design, produce, and sell custom merchandise with the all-in-one operations dashboard built for creators who mean business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 text-base h-12 px-8" asChild>
                <Link to="/login">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base h-12 px-8" asChild>
                <Link to="/login">View Demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              14-day free trial · No credit card required · Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="h-8 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-[10px] text-muted-foreground font-mono">better-daze-dashboard</span>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Revenue", value: "$12,450", change: "+12.5%" },
                      { label: "Active Cycles", value: "7", change: "3 completed" },
                      { label: "Products Live", value: "23", change: "+5 this week" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border p-4 bg-background">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        <p className="text-lg font-bold mt-1">{stat.value}</p>
                        <p className="text-[10px] text-green-600 mt-0.5">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border p-4 bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium">Active Cycles</p>
                      <span className="text-[10px] text-primary">View all</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Summer Vibes Collection", progress: 75, revenue: "$7,234" },
                        { name: "Urban Nightlife Series", progress: 45, revenue: "$3,450" },
                      ].map((cycle) => (
                        <div key={cycle.name}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{cycle.name}</span>
                            <span className="text-muted-foreground">{cycle.revenue}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${cycle.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-background">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Social Presence</p>
                    {[
                      { platform: "Instagram", followers: "12.4K", growth: "+2.4%" },
                      { platform: "TikTok", followers: "8.9K", growth: "+5.1%" },
                      { platform: "Twitter", followers: "5.6K", growth: "+1.2%" },
                    ].map((social) => (
                      <div key={social.platform} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                        <span className="text-xs">{social.platform}</span>
                        <div className="text-right">
                          <p className="text-xs font-medium">{social.followers}</p>
                          <p className="text-[10px] text-green-600">{social.growth}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Pro Tip</p>
                    <p className="text-xs leading-relaxed">
                      Cycles with social pre-launch campaigns see a <strong>43% higher</strong> first-week revenue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to scale</h2>
            <p className="mt-4 text-muted-foreground">
              From first sketch to sold-out drop, Better Daze handles the operations so you can focus on creating.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <span className="text-primary">{feature.icon}</span>
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-primary/[0.03] border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "$2.4M+", label: "Revenue Processed" },
              { value: "50K+", label: "Products Launched" },
              { value: "1,200+", label: "Active Creators" },
              { value: "98%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-xl border p-6 flex flex-col",
                  plan.popular ? "border-primary shadow-lg relative overflow-hidden" : "border-border bg-card"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/login">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-24 border-t border-border bg-primary/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Loved by creators</h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of creators who've streamlined their merch operations.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-primary/20 p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to scale your merch?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Start your 14-day free trial today. No credit card required. Full access to all Growth plan features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 text-base h-12 px-8" asChild>
                <Link to="/login">
                  Start Free Trial
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base h-12 px-8" asChild>
                <Link to="/login">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold">Better Daze</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The all-in-one POD operations dashboard for serious creators.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 Better Daze. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
