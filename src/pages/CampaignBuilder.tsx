import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Rocket,
  Wand2,
  ShoppingBag,
  Megaphone,
  Instagram,
  Twitter,
  TrendingUp,
  Facebook,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  Sparkles,
  Zap,
} from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { id: "tiktok", name: "TikTok", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "twitter", name: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "facebook", name: "Facebook", icon: <Facebook className="h-4 w-4" /> },
];

const steps = [
  { id: "design", name: "AI Design", icon: <Wand2 className="h-4 w-4" />, desc: "Generate designs from prompts" },
  { id: "mockup", name: "Mockup", icon: <ShoppingBag className="h-4 w-4" />, desc: "Apply to products" },
  { id: "store", name: "Store", icon: <ShoppingBag className="h-4 w-4" />, desc: "Auto-publish products" },
  { id: "social", name: "Social", icon: <Megaphone className="h-4 w-4" />, desc: "Schedule posts" },
  { id: "live", name: "Go Live", icon: <Rocket className="h-4 w-4" />, desc: "Launch campaign" },
];

export default function CampaignBuilder() {
  const [campaignName, setCampaignName] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter"]);
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoSocial, setAutoSocial] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [currentStep, setCurrentStep] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([
    { id: 1, name: "Summer Vibes Launch", status: "active", products: 3, posts: 12, reach: "24.5K", progress: 75 },
    { id: 2, name: "Urban Night Drop", status: "scheduled", products: 5, posts: 8, reach: "0", progress: 0 },
    { id: 3, name: "Nature Collection", status: "completed", products: 4, posts: 15, reach: "38.2K", progress: 100 },
  ]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    if (!campaignName) {
      toast.error("Name your campaign first");
      return;
    }
    const newCampaign = {
      id: Date.now(),
      name: campaignName,
      status: "active",
      products: Math.floor(Math.random() * 5 + 2),
      posts: Math.floor(Math.random() * 10 + 5),
      reach: "0",
      progress: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    toast.success("Campaign launched!", {
      description: "Products are being published and social posts are scheduled.",
    });
    setCampaignName("");
    setCampaignDesc("");
    setCurrentStep(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Builder</h1>
            <p className="text-sm text-muted-foreground">
              One-click campaigns: design → mockup → store → social → live.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Automated Pipeline
          </Badge>
        </div>

        {/* Active Campaigns */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant={
                      campaign.status === "active"
                        ? "default"
                        : campaign.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[10px] capitalize"
                  >
                    {campaign.status === "active" ? (
                      <Play className="mr-1 h-3 w-3" />
                    ) : campaign.status === "scheduled" ? (
                      <Clock className="mr-1 h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    )}
                    {campaign.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {campaign.products} products · {campaign.posts} posts
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{campaign.name}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <Progress value={campaign.progress} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-10 text-right">{campaign.progress}%</span>
                </div>
                {campaign.reach !== "0" && (
                  <p className="text-xs text-muted-foreground mt-2">Reach: {campaign.reach}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaign Builder Wizard */}
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <h2 className="text-lg font-semibold">New Campaign</h2>
            <p className="text-sm text-muted-foreground">Configure your automated drop campaign</p>
          </div>

          {/* Step indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, i) => (
                <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${i <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    placeholder="e.g. Summer Vibes Collection Drop"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What's the theme? e.g. Beach-inspired retro designs"
                    value={campaignDesc}
                    onChange={(e) => setCampaignDesc(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(1)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">AI Design Generation</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    AI will generate designs based on your campaign theme
                  </p>
                  <Button variant="outline" onClick={() => toast.success("Designs generated!")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Preview Designs
                  </Button>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button onClick={() => setCurrentStep(2)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Auto-Publish to Store</p>
                      <p className="text-xs text-muted-foreground">Products go live immediately</p>
                    </div>
                  </div>
                  <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Auto-Generate Social Posts</p>
                      <p className="text-xs text-muted-foreground">AI creates captions and schedules posts</p>
                    </div>
                  </div>
                  <Switch checked={autoSocial} onCheckedChange={setAutoSocial} />
                </div>

                <div className="space-y-2">
                  <Label>Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          selectedPlatforms.includes(platform.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {platform.icon}
                        <span>{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Post Frequency</Label>
                  <div className="flex gap-2">
                    {["hourly", "daily", "weekly"].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${
                          frequency === freq
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6">
                  <Rocket className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Ready to Launch</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {campaignName || "Your campaign"} will:
                  </p>
                  <div className="text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Generate AI designs from your theme</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Create product mockups automatically</span>
                    </div>
                    {autoPublish && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Publish products to your store</span>
                      </div>
                    )}
                    {autoSocial && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Schedule {frequency} posts to {selectedPlatforms.length} platforms</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                  <Button onClick={handleLaunch} className="gap-2">
                    <Rocket className="h-4 w-4" />
                    Launch Campaign
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
