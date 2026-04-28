import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Megaphone,
  Instagram,
  Twitter,
  Facebook,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Plus,
} from "lucide-react";
import { useState } from "react";

const campaigns = [
  {
    id: 1,
    name: "Summer Vibes Launch",
    platform: "instagram",
    status: "active",
    scheduled: "2026-05-01T10:00:00",
    metrics: { impressions: 45200, engagement: 3200, clicks: 890 },
  },
  {
    id: 2,
    name: "Urban Night Teaser",
    platform: "tiktok",
    status: "scheduled",
    scheduled: "2026-05-05T14:00:00",
    metrics: { impressions: 0, engagement: 0, clicks: 0 },
  },
  {
    id: 3,
    name: "Flash Sale Friday",
    platform: "twitter",
    status: "completed",
    scheduled: "2026-04-25T09:00:00",
    metrics: { impressions: 23100, engagement: 1800, clicks: 456 },
  },
];

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <TrendingUp className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
};

export default function Marketing() {
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
            <p className="text-sm text-muted-foreground">
              Schedule posts, manage campaigns, and track social performance.
            </p>
          </div>
          <Button className="gap-2" onClick={() => toast.success("Campaign creation coming soon!")}>
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Impressions</span>
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
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Click Rate</span>
              </div>
              <p className="text-2xl font-bold">2.8%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {platformIcons[campaign.platform] || <Megaphone className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant={
                                campaign.status === "active"
                                  ? "default"
                                  : campaign.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-[10px] capitalize"
                            >
                              {campaign.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(campaign.scheduled).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat("en-US").format(campaign.metrics.impressions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="text-sm font-medium">{campaign.metrics.clicks}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg border flex items-center justify-center text-sm relative ${
                        [1, 5, 12, 18, 25].includes(i + 1)
                          ? "bg-primary/10 border-primary/30 font-medium text-primary"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      {i + 1}
                      {[1, 5, 12, 18, 25].includes(i + 1) && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { platform: "Instagram", followers: 12450, growth: 12.5, engagement: 4.2 },
                  { platform: "TikTok", followers: 8930, growth: 28.3, engagement: 6.8 },
                  { platform: "Twitter", followers: 5600, growth: 5.1, engagement: 2.1 },
                ].map((platform) => (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{platform.platform}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          +{platform.growth}%
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("en-US").format(platform.followers)} followers
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">Engagement</span>
                      <Progress value={platform.engagement * 10} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">{platform.engagement}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
