import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Megaphone,
  Instagram,
  Twitter,
  Facebook,
  Calendar,
  Clock,
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  Wand2,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Bot,
  Sparkles,
  Loader2,
} from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: <Instagram className="h-4 w-4" />, color: "bg-pink-50 text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: <TrendingUp className="h-4 w-4" />, color: "bg-slate-50 text-slate-600" },
  { id: "twitter", name: "Twitter", icon: <Twitter className="h-4 w-4" />, color: "bg-blue-50 text-blue-600" },
  { id: "facebook", name: "Facebook", icon: <Facebook className="h-4 w-4" />, color: "bg-indigo-50 text-indigo-600" },
];

// Auto-generated captions based on product
function generateCaption(productName: string, style: string) {
  const hooks = [
    `Just dropped: ${productName} — Limited run, grab yours before it's gone!`,
    `Your new favorite ${style} piece is here. ${productName} — now live.`,
    `Obsessed with this new design. ${productName} available now!`,
    `New drop alert: ${productName} is ready for you.`,
  ];
  const hashtags = ["#PrintOnDemand", "#Streetwear", "#CustomApparel", "#BetterDaze", "#NewDrop", "#LimitedEdition"];
  return {
    caption: hooks[Math.floor(Math.random() * hooks.length)],
    hashtags: hashtags.sort(() => Math.random() - 0.5).slice(0, 4),
  };
}

export default function SocialAutopilot() {
  const utils = trpc.useUtils();

  // tRPC queries and mutations
  const { data: dbTemplates, isLoading: loadingTemplates } = trpc.campaign.templates.list.useQuery();
  const { data: dbPosts, isLoading: loadingPosts } = trpc.campaign.posts.list.useQuery();
  const createTemplate = trpc.campaign.templates.create.useMutation({
    onSuccess: () => {
      utils.campaign.templates.list.invalidate();
      toast.success("Template saved!");
    },
  });
  const deleteTemplate = trpc.campaign.templates.delete.useMutation({
    onSuccess: () => {
      utils.campaign.templates.list.invalidate();
      toast.success("Template deleted");
    },
  });
  const createPost = trpc.campaign.posts.create.useMutation({
    onSuccess: () => {
      utils.campaign.posts.list.invalidate();
      toast.success("Post scheduled!");
    },
  });
  const deletePost = trpc.campaign.posts.delete.useMutation({
    onSuccess: () => {
      utils.campaign.posts.list.invalidate();
      toast.success("Post removed");
    },
  });
  const [activeTab, setActiveTab] = useState("autopilot");
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter"]);
  const [postFrequency, setPostFrequency] = useState("daily");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCaption, setNewTemplateCaption] = useState("");
  const [newTemplatePlatform, setNewTemplatePlatform] = useState<"instagram" | "tiktok" | "twitter" | "facebook" | "pinterest">("instagram");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState<"instagram" | "tiktok" | "twitter" | "facebook" | "pinterest" | "youtube" | "other">("instagram");

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleEnableAutopilot = () => {
    setAutopilotEnabled(true);
    toast.success("Social Autopilot enabled!", {
      description: `Posting ${postFrequency} to ${selectedPlatforms.length} platforms`,
    });
  };

  const handleAddTemplate = () => {
    if (!newTemplateName || !newTemplateCaption) {
      toast.error("Fill in template details");
      return;
    }
    createTemplate.mutate({
      name: newTemplateName,
      platform: newTemplatePlatform,
      captionTemplate: newTemplateCaption,
      hashtagSet: ["#BetterDaze", "#PrintOnDemand"],
    });
    setNewTemplateName("");
    setNewTemplateCaption("");
  };

  const handleGeneratePosts = () => {
    const captions = [
      generateCaption("Neon City Tee", "urban"),
      generateCaption("Sunset Dreams Hoodie", "retro"),
    ];
    captions.forEach((c, i) => {
      const platform = (["instagram", "twitter"] as const)[i % 2];
      createPost.mutate({
        cycleId: 1,
        platform,
        content: `${c.caption} ${c.hashtags.join(" ")}`,
        scheduledAt: new Date(Date.now() + (i + 1) * 86400000),
        status: "draft",
      });
    });
    toast.success("AI-generated posts ready for review!");
  };

  const handleCreatePost = () => {
    if (!newPostContent) {
      toast.error("Enter post content");
      return;
    }
    createPost.mutate({
      cycleId: 1,
      platform: newPostPlatform,
      content: newPostContent,
      scheduledAt: new Date(Date.now() + 86400000),
      status: "scheduled",
    });
    setNewPostContent("");
  };

  const platformBadgeColor = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p?.color || "bg-muted";
  };

  const platformIcon = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p?.icon || <Megaphone className="h-4 w-4" />;
  };

  const platformName = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p?.name || platform;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Social Autopilot</h1>
            <p className="text-sm text-muted-foreground">
              Automate your social media presence. AI generates posts, schedules drops, and engages.
            </p>
          </div>
          <Badge variant={autopilotEnabled ? "default" : "secondary"} className="gap-1">
            <Bot className="h-3 w-3" />
            {autopilotEnabled ? "Autopilot ON" : "Autopilot OFF"}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="autopilot" className="gap-2">
              <Zap className="h-4 w-4" />
              Autopilot
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="gap-2">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="autopilot" className="space-y-6">
            <Card className={autopilotEnabled ? "border-primary/50 bg-primary/[0.02]" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${autopilotEnabled ? "bg-primary" : "bg-muted"}`}>
                      <Bot className={`h-6 w-6 ${autopilotEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Social Media Autopilot</h3>
                      <p className="text-sm text-muted-foreground">
                        Let AI create, schedule, and post content across your connected platforms.
                      </p>
                    </div>
                  </div>
                  <Switch checked={autopilotEnabled} onCheckedChange={(v) => v ? handleEnableAutopilot() : setAutopilotEnabled(false)} />
                </div>

                {autopilotEnabled && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Active Platforms</Label>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selectedPlatforms.includes(platform.id)
                                ? `${platform.color} border-current`
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {platform.icon}
                            <span className="font-medium">{platform.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Post Frequency</Label>
                      <div className="flex gap-2">
                        {["hourly", "daily", "weekly"].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setPostFrequency(freq)}
                            className={`rounded-lg border px-4 py-2 text-sm capitalize transition-colors ${
                              postFrequency === freq
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Autopilot will generate product-focused posts, engagement hooks, and drop announcements automatically.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Impressions</span>
                  </div>
                  <p className="text-2xl font-bold">68.3K</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Engagements</span>
                  </div>
                  <p className="text-2xl font-bold">5.0K</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Shares</span>
                  </div>
                  <p className="text-2xl font-bold">1,240</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Comments</span>
                  </div>
                  <p className="text-2xl font-bold">892</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <select
                      value={newPostPlatform}
                      onChange={(e) => setNewPostPlatform(e.target.value as any)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {platforms.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Input type="datetime-local" defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 16)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <textarea
                    placeholder="What's happening?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} disabled={createPost.isPending || !newPostContent}>
                    {createPost.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Schedule Post
                  </Button>
                  <Button variant="outline" onClick={handleGeneratePosts} disabled={createPost.isPending}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scheduled Posts</h3>
              <Badge variant="secondary">{dbPosts?.length || 0} posts</Badge>
            </div>

            {loadingPosts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !dbPosts || dbPosts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scheduled posts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbPosts.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${platformBadgeColor(post.platform)}`}>
                          {platformIcon(post.platform)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.content}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{platformName(post.platform)}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : "Draft"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={post.status === "published" ? "secondary" : post.status === "scheduled" ? "default" : "outline"}
                          className="text-[10px] capitalize"
                        >
                          {post.status === "published" ? (
                            <Play className="mr-1 h-3 w-3" />
                          ) : post.status === "scheduled" ? (
                            <Calendar className="mr-1 h-3 w-3" />
                          ) : (
                            <Pause className="mr-1 h-3 w-3" />
                          )}
                          {post.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deletePost.mutate({ id: post.id })}
                          disabled={deletePost.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Template</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g. Product Launch"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <select
                      value={newTemplatePlatform}
                      onChange={(e) => setNewTemplatePlatform(e.target.value as any)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {platforms.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Caption Template</Label>
                  <textarea
                    placeholder="Use {productName} and {price} as placeholders..."
                    value={newTemplateCaption}
                    onChange={(e) => setNewTemplateCaption(e.target.value)}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button onClick={handleAddTemplate} disabled={createTemplate.isPending || !newTemplateName || !newTemplateCaption}>
                  {createTemplate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Save Template
                </Button>
              </div>
            </Card>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !dbTemplates || dbTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No templates yet. Create your first one above.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dbTemplates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${platformBadgeColor(template.platform)}`}>
                          {platformIcon(template.platform)}
                        </div>
                        <span className="text-sm font-medium">{template.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteTemplate.mutate({ id: template.id })}
                        disabled={deleteTemplate.isPending}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{template.captionTemplate}</p>
                    {template.hashtagSet && Array.isArray(template.hashtagSet) && (template.hashtagSet as string[]).length > 0 ? (
                      <p className="text-[10px] text-primary mt-2">{(template.hashtagSet as string[]).join(" ")}</p>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Platform Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${platform.color}`}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">+2.4% this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{Math.floor(Math.random() * 50 + 10)}K</p>
                        <p className="text-[10px] text-muted-foreground">impressions</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { platform: "instagram", content: "Summer Vibes drop", engagement: "4.2K" },
                    { platform: "tiktok", content: "POV: New hoodie", engagement: "3.8K" },
                    { platform: "twitter", content: "Limited run alert", engagement: "2.1K" },
                  ].map((post, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">{post.platform}</span>
                        <span className="text-sm truncate max-w-[200px]">{post.content}</span>
                      </div>
                      <span className="text-sm font-medium">{post.engagement}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
