import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Key,
  Store,
  Share2,
  Printer,
  Image,
  CreditCard,
  Bot,
} from "lucide-react";

const serviceConfig: Record<string, { icon: React.ReactNode; color: string; category: string }> = {
  shopify: { icon: <Store className="h-5 w-5" />, color: "text-green-600 bg-green-50", category: "E-Commerce" },
  printify: { icon: <Printer className="h-5 w-5" />, color: "text-blue-600 bg-blue-50", category: "Print-on-Demand" },
  ayrshare: { icon: <Share2 className="h-5 w-5" />, color: "text-purple-600 bg-purple-50", category: "Social Media" },
  openai: { icon: <Bot className="h-5 w-5" />, color: "text-teal-600 bg-teal-50", category: "AI / LLM" },
  stripe: { icon: <CreditCard className="h-5 w-5" />, color: "text-indigo-600 bg-indigo-50", category: "Payments" },
  unsplash: { icon: <Image className="h-5 w-5" />, color: "text-pink-600 bg-pink-50", category: "Assets" },
};

function statusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className: string }> = {
    active: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" />, className: "bg-green-100 text-green-700 hover:bg-green-100" },
    expiring: { variant: "outline", icon: <Clock className="h-3 w-3" />, className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
    expired: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, className: "" },
    needs_rotation: { variant: "outline", icon: <AlertTriangle className="h-3 w-3" />, className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
    error: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, className: "" },
    unknown: { variant: "secondary", icon: <Clock className="h-3 w-3" />, className: "" },
  };
  const config = variants[status] || variants.unknown;
  return (
    <Badge variant={config.variant} className={`capitalize gap-1 text-[10px] ${config.className}`}>
      {config.icon}
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function HealthPanel() {
  const utils = trpc.useUtils();
  const { data: credentials, isLoading } = trpc.operations.credentials.list.useQuery();
  const upsertCredential = trpc.operations.credentials.upsert.useMutation({
    onSuccess: () => {
      utils.operations.credentials.list.invalidate();
      toast.success("Credential saved!");
    },
  });
  const updateStatus = trpc.operations.credentials.updateStatus.useMutation({
    onSuccess: () => {
      utils.operations.credentials.list.invalidate();
      toast.success("Status updated");
    },
  });
  const deleteCredential = trpc.operations.credentials.delete.useMutation({
    onSuccess: () => {
      utils.operations.credentials.list.invalidate();
      toast.success("Credential removed");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState("shopify");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "expiring" | "expired" | "needs_rotation" | "error" | "unknown">("active");

  const activeCount = (credentials || []).filter((c) => c.status === "active").length;
  const issueCount = (credentials || []).filter((c) => ["expiring", "expired", "needs_rotation", "error"].includes(c.status)).length;

  const handleAdd = () => {
    if (!newDisplayName.trim()) {
      toast.error("Enter a display name");
      return;
    }
    upsertCredential.mutate({
      serviceName: newService,
      displayName: newDisplayName,
      userId: 1,
      status: newStatus,
    });
    setNewDisplayName("");
    setShowForm(false);
  };

  const handleQuickStatus = (serviceName: string, status: "active" | "expiring" | "expired" | "needs_rotation" | "error") => {
    updateStatus.mutate({ serviceName, status });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Health Panel</h1>
            <p className="text-sm text-muted-foreground">
              Monitor API credential status for all connected services. Never displays actual credential values.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => utils.operations.credentials.list.invalidate()}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Alert banner */}
        {issueCount > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {issueCount} credential{issueCount > 1 ? "s" : ""} need{issueCount === 1 ? "s" : ""} attention
              </p>
              <p className="text-xs text-amber-600">
                Review expiring, expired, or credentials that need rotation below.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Services</span>
              </div>
              <p className="text-2xl font-bold">{credentials?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Issues</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{issueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Add API Service</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Service</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="shopify">Shopify</option>
                    <option value="printify">Printify</option>
                    <option value="ayrshare">Ayrshare</option>
                    <option value="openai">OpenAI</option>
                    <option value="stripe">Stripe</option>
                    <option value="unsplash">Unsplash</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="expiring">Expiring</option>
                    <option value="expired">Expired</option>
                    <option value="needs_rotation">Needs Rotation</option>
                    <option value="error">Error</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <Input
                placeholder="Display name (e.g. Shopify Production Store)"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={upsertCredential.isPending} size="sm">
                  {upsertCredential.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Credentials List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !credentials || credentials.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No services monitored yet.</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Service
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {credentials.map((cred) => {
              const config = serviceConfig[cred.serviceName] || {
                icon: <Key className="h-5 w-5" />,
                color: "text-gray-600 bg-gray-50",
                category: "Other",
              };
              const isIssue = ["expiring", "expired", "needs_rotation", "error"].includes(cred.status);

              return (
                <Card key={cred.id} className={isIssue ? "border-amber-200" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{cred.displayName}</p>
                            {statusBadge(cred.status)}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{config.category} · {cred.serviceName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {cred.lastVerifiedAt && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified {new Date(cred.lastVerifiedAt).toLocaleDateString()}
                              </span>
                            )}
                            {cred.expiresAt && (
                              <span className={`text-[10px] flex items-center gap-1 ${
                                cred.status === "expiring" ? "text-amber-600" : "text-muted-foreground"
                              }`}>
                                <Clock className="h-3 w-3" />
                                Expires {new Date(cred.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                            {cred.scope && (
                              <span className="text-[10px] text-muted-foreground">
                                Scope: {cred.scope}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => handleQuickStatus(cred.serviceName, "active")}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          Active
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => handleQuickStatus(cred.serviceName, "needs_rotation")}
                          disabled={updateStatus.isPending}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                          Rotate
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteCredential.mutate({ serviceName: cred.serviceName })}
                          disabled={deleteCredential.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <Shield className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-800">
            Credential values are never stored or displayed in this dashboard. Only service names, status, and metadata are tracked.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
