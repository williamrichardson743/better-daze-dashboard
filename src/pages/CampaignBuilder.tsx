import { useState } from "react";
import { trpc } from "@/providers/trpc";
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
  Rocket, Wand2, ShoppingBag, Megaphone, CheckCircle2, Clock,
  ArrowRight, Sparkles, Zap, Instagram, Twitter, TrendingUp, Facebook,
} from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { id: "tiktok", name: "TikTok", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "twitter", name: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "facebook", name: "Facebook", icon: <Facebook className="h-4 w-4" /> },
];

export default function CampaignBuilder() {
  const utils = trpc.useUtils();
  const { data: dbCampaigns, isLoading } = trpc.campaign.campaigns.list.useQuery();
  const createCampaign = trpc.campaign.campaigns.create.useMutation({
    onSuccess: () => {
      utils.campaign.campaigns.list.invalidate();
      toast.success("Campaign created and launched!");
    },
  });
  const updateCampaign = trpc.campaign.campaigns.update.useMutation({
    onSuccess: () => utils.campaign.campaigns.list.invalidate(),
  });

  const [campaignName, setCampaignName] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter"]);
  const [autoPublish, setAutoPublish] = useState(true);
  const [autoSocial, setAutoSocial] = useState(true);
  const [frequency, setFrequency] = useState<"hourly" | "daily" | "weekly">("daily");
  const [currentStep, setCurrentStep] = useState(0);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    if (!campaignName) { toast.error("Name your campaign"); return; }
    createCampaign.mutate({
      name: campaignName,
      description: campaignDesc,
      platforms: selectedPlatforms,
      autoPublishProducts: autoPublish,
      autoGenerateSocial: autoSocial,
      postFrequency: frequency,
      startDate: new Date(),
    });
    setCampaignName(""); setCampaignDesc(""); setCurrentStep(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Builder</h1>
            <p className="text-sm text-muted-foreground">
              One-click automated pipeline: design to mockup to store to social.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Automated Pipeline
          </Badge>
        </div>

        {/* Active Campaigns from DB */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading campaigns...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dbCampaigns?.map((campaign) => {
              const progress =
                campaign.status === "completed" ? 100 :
                campaign.status === "active" ? 75 :
                campaign.status === "scheduled" ? 25 : 0;
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={campaign.status === "active" ? "default" : campaign.status === "completed" ? "secondary" : "outline"} className="text-[10px] capitalize">
                        {campaign.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(campaign.platforms as string[] || []).join(", ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{campaign.name}</h3>
                    <p className="text-xs text-muted-foreground">{campaign.description || "No description"}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">{progress}%</span>
                    </div>
                    {campaign.status === "draft" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1" onClick={() => updateCampaign.mutate({ id: campaign.id, status: "active" })}>
                          <Rocket className="mr-1 h-3.5 w-3.5" />
                          Launch
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {(!dbCampaigns || dbCampaigns.length === 0) && (
              <p className="text-muted-foreground col-span-full">No campaigns yet. Create your first one below.</p>
            )}
          </div>
        )}

        {/* Campaign Wizard */}
        <Card>
          <div className="border-b bg-muted/30 px-6 py-4">
            <h2 className="text-lg font-semibold">New Campaign</h2>
          </div>
          <CardContent className="p-6 space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g. Summer Vibes Collection Drop" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="What's the theme?" value={campaignDesc} onChange={(e) => setCampaignDesc(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(1)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">AI Design Generation</p>
                  <p className="text-xs text-muted-foreground mb-4">AI generates designs from your campaign theme</p>
                  <Button variant="outline" onClick={() => toast.success("3 designs generated!")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Preview Designs
                  </Button>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button onClick={() => setCurrentStep(2)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
                  <Button onClick={() => setCurrentStep(3)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
                      <p className="text-xs text-muted-foreground">AI creates captions and schedules</p>
                    </div>
                  </div>
                  <Switch checked={autoSocial} onCheckedChange={setAutoSocial} />
                </div>
                <div className="space-y-2">
                  <Label>Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => (
                      <button key={p.id} onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selectedPlatforms.includes(p.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                        {p.icon} <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Post Frequency</Label>
                  <div className="flex gap-2">
                    {(["hourly", "daily", "weekly"] as const).map((f) => (
                      <button key={f} onClick={() => setFrequency(f)}
                        className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${frequency === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                  <Button onClick={() => setCurrentStep(4)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}
            {currentStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6">
                  <Rocket className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Ready to Launch</h3>
                  <p className="text-sm text-muted-foreground mb-4">{campaignName || "Your campaign"} will:</p>
                  <div className="text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600" /><span>Generate AI designs</span></div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600" /><span>Create product mockups</span></div>
                    {autoPublish && <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600" /><span>Publish to store</span></div>}
                    {autoSocial && <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600" /><span>Schedule {frequency} posts to {selectedPlatforms.length} platforms</span></div>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                  <Button onClick={handleLaunch} disabled={createCampaign.isPending} className="gap-2">
                    {createCampaign.isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
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
