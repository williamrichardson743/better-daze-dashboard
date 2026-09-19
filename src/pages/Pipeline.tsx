import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GitBranch,
  Loader2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  TrendingUp,
  Palette,
  Printer,
  ShoppingBag,
  Share2,
  FileText,
  Plus,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const phases = [
  { id: "trend", name: "Trend Research", icon: <TrendingUp className="h-5 w-5" />, desc: "Analyze market trends & niches" },
  { id: "design", name: "Design", icon: <Palette className="h-5 w-5" />, desc: "AI-generated designs from prompts" },
  { id: "printify", name: "Printify", icon: <Printer className="h-5 w-5" />, desc: "Create product mockups & variants" },
  { id: "shopify", name: "Shopify", icon: <ShoppingBag className="h-5 w-5" />, desc: "Publish products to storefront" },
  { id: "social", name: "Social", icon: <Share2 className="h-5 w-5" />, desc: "Auto-post across platforms" },
  { id: "log", name: "Log", icon: <FileText className="h-5 w-5" />, desc: "Record results & analytics" },
];

function phaseStatusFromRun(run: any, phaseId: string): string {
  const key = `${phaseId}PhaseStatus` as const;
  return run?.[key] || "pending";
}

function phaseProgress(run: any): number {
  if (!run) return 0;
  const phaseKeys = ["trendPhaseStatus", "designPhaseStatus", "printifyPhaseStatus", "shopifyPhaseStatus", "socialPhaseStatus", "logPhaseStatus"];
  const completed = phaseKeys.filter((k) => run[k] === "completed").length;
  return Math.round((completed / phaseKeys.length) * 100);
}

function statusIcon(status: string) {
  switch (status) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in_progress": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
    case "cancelled": return <PauseCircle className="h-4 w-4 text-amber-500" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    completed: "default",
    in_progress: "secondary",
    failed: "destructive",
    cancelled: "outline",
    pending: "outline",
  };
  return <Badge variant={variants[status] || "outline"} className="capitalize text-[10px]">{status.replace("_", " ")}</Badge>;
}

export default function Pipeline() {
  const utils = trpc.useUtils();
  const { data: runs, isLoading } = trpc.operations.pipeline.list.useQuery();
  const createRun = trpc.operations.pipeline.create.useMutation({
    onSuccess: () => {
      utils.operations.pipeline.list.invalidate();
      toast.success("New pipeline cycle created!");
    },
  });
  // Designs available to publish: products that already carry an image.
  const { data: products } = trpc.dashboard.products.useQuery();
  const publishableProducts = (products || []).filter((p) => p.designUrl || p.mockupUrl);

  const [startTarget, setStartTarget] = useState<number | null>(null);
  const [slogan, setSlogan] = useState("");
  const [designImageUrl, setDesignImageUrl] = useState("");
  const [productType, setProductType] = useState<"tee" | "mug" | "poster" | "hoodie">("tee");

  const startRun = trpc.operations.pipeline.start.useMutation({
    onSuccess: (result) => {
      utils.operations.pipeline.list.invalidate();
      if (!result.success) {
        toast.error(result.error ?? "Publish failed.");
        return;
      }
      if (result.replayed) {
        toast.info("Already published — returned the existing Printify/Shopify product.");
      } else {
        toast.success(
          result.shopifyProductId
            ? `Published. Printify ${result.printifyProductId} → Shopify ${result.shopifyProductId}`
            : `Created on Printify (${result.printifyProductId}). Shopify id still pending.`
        );
      }
      closeStartDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const closeStartDialog = () => {
    setStartTarget(null);
    setSlogan("");
    setDesignImageUrl("");
    setProductType("tee");
  };

  const handleStart = () => {
    if (startTarget === null) return;
    // Without a slogan and an image the server cannot run Phase 3 — it would
    // only flip the run to in_progress and publish nothing.
    if (!slogan.trim() || !designImageUrl.trim()) {
      toast.error("A slogan and a design image URL are both required to publish.");
      return;
    }
    startRun.mutate({
      id: startTarget,
      slogan: slogan.trim(),
      designImageUrl: designImageUrl.trim(),
      productType,
    });
  };

  const activeRuns = (runs || []).filter((r) => r.status === "in_progress");
  const completedRuns = (runs || []).filter((r) => r.status === "completed");
  const failedRuns = (runs || []).filter((r) => r.status === "failed");

  const handleCreateCycle = () => {
    createRun.mutate({
      name: `Autonomous Cycle ${(runs?.length || 0) + 1}`,
      status: "pending",
      currentPhase: "trend",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              Visualize and manage the 6-phase autonomous POD cycle.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => utils.operations.pipeline.list.invalidate()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateCycle} disabled={createRun.isPending}>
              {createRun.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              New Cycle
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Runs</span>
              </div>
              <p className="text-2xl font-bold">{runs?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold">{activeRuns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-2xl font-bold">{completedRuns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Failed</span>
              </div>
              <p className="text-2xl font-bold">{failedRuns.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Legend */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">6-Phase Cycle Flow</h3>
          <div className="flex flex-wrap items-center gap-2">
            {phases.map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-muted/30">
                  <div className="text-primary">{phase.icon}</div>
                  <div>
                    <p className="text-xs font-medium">{phase.name}</p>
                    <p className="text-[10px] text-muted-foreground">{phase.desc}</p>
                  </div>
                </div>
                {i < phases.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </Card>

        {/* Pipeline Runs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pipeline Runs</h3>
            {activeRuns.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {activeRuns.length} active
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !runs || runs.length === 0 ? (
            <Card className="p-8 text-center">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pipeline runs yet.</p>
              <Button className="mt-4" onClick={handleCreateCycle}>
                <Plus className="mr-2 h-4 w-4" />
                Start First Cycle
              </Button>
            </Card>
          ) : (
            runs.map((run) => {
              const progress = phaseProgress(run);
              const isActive = run.status === "in_progress";
              return (
                <Card key={run.id} className={isActive ? "border-primary/30" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {statusIcon(run.status)}
                        <div>
                          <CardTitle className="text-base">{run.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Started {run.startedAt ? new Date(run.startedAt).toLocaleString() : "Not started"}
                            {run.duration && ` · ${Math.floor(run.duration / 60)}m ${run.duration % 60}s`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(run.status)}
                        {run.status === "pending" && (
                          <Button size="sm" onClick={() => setStartTarget(run.id)} disabled={startRun.isPending}>
                            <Play className="mr-1 h-3 w-3" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {phases.map((phase) => {
                        const ps = phaseStatusFromRun(run, phase.id);
                        const isCurrent = run.currentPhase === phase.id;
                        return (
                          <div
                            key={phase.id}
                            className={`rounded-lg border p-2 text-center transition-colors ${
                              isCurrent ? "border-primary bg-primary/5" : "border-border"
                            } ${ps === "completed" ? "bg-green-50 border-green-200" : ""} ${ps === "failed" ? "bg-red-50 border-red-200" : ""}`}
                          >
                            <div className="flex justify-center mb-1">{phase.icon}</div>
                            <p className="text-[10px] font-medium">{phase.name}</p>
                            <div className="flex justify-center mt-1">
                              {ps === "completed" ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : ps === "in_progress" ? (
                                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                              ) : ps === "failed" ? (
                                <XCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {run.errorMessage && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-800">{run.errorMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={startTarget !== null} onOpenChange={(open) => !open && closeStartDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Printify and Shopify</DialogTitle>
            <DialogDescription>
              This uploads the design to Printify, creates the product, and publishes it to the
              connected Shopify store. Running it twice with the same slogan and product type
              returns the existing product instead of creating a duplicate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pipeline-slogan">Slogan</Label>
              <Input
                id="pipeline-slogan"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Better Daze Ahead"
              />
            </div>

            <div>
              <Label htmlFor="pipeline-product-type">Product type</Label>
              <select
                id="pipeline-product-type"
                value={productType}
                onChange={(e) =>
                  setProductType(e.target.value as "tee" | "mug" | "poster" | "hoodie")
                }
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="tee">T-shirt</option>
                <option value="hoodie">Hoodie</option>
                <option value="mug">Mug</option>
                <option value="poster">Poster</option>
              </select>
            </div>

            {publishableProducts.length > 0 && (
              <div>
                <Label htmlFor="pipeline-existing-design">Use an existing design</Label>
                <select
                  id="pipeline-existing-design"
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  onChange={(e) => {
                    const chosen = publishableProducts.find(
                      (p) => String(p.id) === e.target.value
                    );
                    if (!chosen) return;
                    setDesignImageUrl(chosen.designUrl || chosen.mockupUrl || "");
                    if (!slogan) setSlogan(chosen.slogan || chosen.name);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a design from Design Studio
                  </option>
                  {publishableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="pipeline-design-url">Design image URL</Label>
              <Input
                id="pipeline-design-url"
                value={designImageUrl}
                onChange={(e) => setDesignImageUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Printify downloads this image, so it has to be publicly reachable.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeStartDialog}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={startRun.isPending}>
              {startRun.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
