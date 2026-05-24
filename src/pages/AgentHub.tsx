import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  MapPin,
  Layers,
  ShieldAlert,
  History,
  Database,
} from "lucide-react";

export default function AgentHub() {
  const utils = trpc.useContext();
  const { data: tasks, isLoading } = trpc.agentHub.listTasks.useQuery({});
  const { data: user } = trpc.auth.me.useQuery();

  const [pushAlerts, setPushAlerts] = useState<
    Array<{ id: number; message: string }>
  >([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [category, setCategory] = useState("01_content_creation");
  const [isHyperLocal, setIsHyperLocal] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const createTaskMutation = trpc.agentHub.createTask.useMutation({
    onSuccess: () => {
      utils.agentHub.listTasks.invalidate();
      setTitle("");
      setDescription("");
    },
  });

  const approveTaskMutation = trpc.agentHub.updateTaskStatus.useMutation({
    onSuccess: () => utils.agentHub.listTasks.invalidate(),
  });

  // Derive approval-gate alerts from live task list
  useEffect(() => {
    const gated =
      tasks?.filter(t => t.requiresApproval && t.status === "pending") ?? [];
    setPushAlerts(
      gated.map(t => ({
        id: t.id,
        message: `ACTION CONSTRAINED: "${t.title}" holds pipeline progress. Signature validation required.`,
      }))
    );
  }, [tasks]);

  const isAdmin = user?.role === "admin";

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="p-8 text-center font-mono animate-pulse">
          LOADING SYSTEM CONTEXT...
        </div>
      </DashboardLayout>
    );

  const pending = tasks?.filter(t => t.status === "pending") || [];
  const inProgress = tasks?.filter(t => t.status === "in_progress") || [];
  const completed = tasks?.filter(t => t.status === "completed") || [];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createTaskMutation.mutateAsync({
      title,
      description,
      priority,
      category,
      requiresApproval,
      metadata: { isHyperLocal },
    });
  };

  const getPriorityColor = (lvl: string) => {
    switch (lvl) {
      case "urgent":
        return "bg-red-600 text-white border-red-700";
      case "high":
        return "bg-orange-500 text-black border-orange-600";
      case "medium":
        return "bg-amber-400 text-black border-amber-500";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 font-mono max-w-7xl mx-auto text-zinc-900 dark:text-zinc-50">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-black dark:border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Agent Operational Hub
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase">
              Classification: Unclassified // Dissemination: Unlimited
            </p>
          </div>
          <div className="text-right text-xs bg-black text-white px-3 py-1.5 uppercase font-bold tracking-widest dark:bg-zinc-800">
            DOC. NO. BD-OPS-2026
          </div>
        </div>

        {/* Approval-gate alert banner */}
        {pushAlerts.length > 0 && (
          <div className="border-4 border-red-600 bg-red-50 dark:bg-zinc-950 text-red-600 p-4 rounded-none shadow-md space-y-2">
            <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
              <ShieldAlert className="h-5 w-5 animate-bounce" />
              <span>⚠️ Core Push Notification: Attention Flag Set</span>
            </div>
            <div className="text-xs space-y-1.5 font-bold">
              {pushAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="bg-white dark:bg-red-950/40 p-2 border border-red-300 flex justify-between items-center"
                >
                  <span>{alert.message}</span>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 ml-4 shrink-0">
                    PENDING VERIFICATION
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending */}
          <Card className="border-2 border-black rounded-none shadow-md bg-zinc-50 dark:bg-zinc-900/40">
            <CardHeader className="border-b-2 border-black bg-white dark:bg-zinc-950 p-4">
              <CardTitle className="text-base font-bold uppercase flex justify-between items-center">
                <span>01 // Pending Gates</span>
                <Badge
                  variant="secondary"
                  className="rounded-none bg-black text-white"
                >
                  {pending.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {pending.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onApprove={() =>
                    approveTaskMutation.mutate({
                      taskId: task.id,
                      status: "in_progress",
                      agentLog:
                        "Vector manual clearance verified. Action dispatched to execution pipeline.",
                    })
                  }
                  colorFn={getPriorityColor}
                />
              ))}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="border-2 border-black rounded-none shadow-md bg-zinc-50 dark:bg-zinc-900/40">
            <CardHeader className="border-b-2 border-black bg-white dark:bg-zinc-950 p-4">
              <CardTitle className="text-base font-bold uppercase flex justify-between items-center">
                <span>02 // Pipeline Execution</span>
                <Badge
                  variant="secondary"
                  className="rounded-none bg-black text-white"
                >
                  {inProgress.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {inProgress.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  onApprove={() =>
                    approveTaskMutation.mutate({
                      taskId: task.id,
                      status: "completed",
                      agentLog:
                        "Pipeline execution finished. Triggering state machine evaluation.",
                    })
                  }
                  isRunning
                  colorFn={getPriorityColor}
                />
              ))}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-2 border-black rounded-none shadow-md bg-zinc-50 dark:bg-zinc-900/40">
            <CardHeader className="border-b-2 border-black bg-white dark:bg-zinc-950 p-4">
              <CardTitle className="text-base font-bold uppercase flex justify-between items-center">
                <span>03 // Logged Output</span>
                <Badge
                  variant="secondary"
                  className="rounded-none bg-black text-white"
                >
                  {completed.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {completed.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                  colorFn={getPriorityColor}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Admin Task Injection */}
        {isAdmin && (
          <Card className="border-2 border-black rounded-none bg-white dark:bg-zinc-950">
            <CardHeader className="border-b border-zinc-200 p-4 bg-zinc-50 dark:bg-zinc-900">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4" /> Inject New Tactical Vector
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleCreateTask}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase font-bold">
                      Vector Heading (Title)
                    </Label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g., Run Drop Sequence"
                      className="rounded-none border-zinc-400 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase font-bold">
                      Operational Context (Description)
                    </Label>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Provide task directives..."
                      className="rounded-none border-zinc-400 mt-1 h-24"
                    />
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase font-bold">
                        Marketing Blueprint Gap
                      </Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-none border-zinc-400 mt-1 uppercase text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-mono text-xs uppercase">
                          <SelectItem value="01_content_creation">
                            01 Content Creation
                          </SelectItem>
                          <SelectItem value="02_platform_presence">
                            02 Platform Presence
                          </SelectItem>
                          <SelectItem value="03_email_dm_outreach">
                            03 Email & DM Outreach
                          </SelectItem>
                          <SelectItem value="04_closing_conversion">
                            04 Closing & Conversion
                          </SelectItem>
                          <SelectItem value="05_brand_building">
                            05 Brand Building
                          </SelectItem>
                          <SelectItem value="06_local_community">
                            06 Local & Community
                          </SelectItem>
                          <SelectItem value="07_seo_discoverability">
                            07 SEO & Discoverability
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase font-bold">
                        Risk Priority
                      </Label>
                      <Select
                        value={priority}
                        onValueChange={(v: any) => setPriority(v)}
                      >
                        <SelectTrigger className="rounded-none border-zinc-400 mt-1 uppercase text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-mono text-xs uppercase">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs uppercase font-bold flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-amber-500" />{" "}
                          Hyper-Local Scope
                        </Label>
                        <p className="text-[10px] text-zinc-500">
                          Flags alignment to North Marin / Novato, CA
                          parameters.
                        </p>
                      </div>
                      <Switch
                        checked={isHyperLocal}
                        onCheckedChange={setIsHyperLocal}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs uppercase font-bold flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" /> Mandatory
                          Approval Gate
                        </Label>
                        <p className="text-[10px] text-zinc-500">
                          Requires manual confirmation before automation
                          execution.
                        </p>
                      </div>
                      <Switch
                        checked={requiresApproval}
                        onCheckedChange={setRequiresApproval}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="w-full rounded-none bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {createTaskMutation.isPending
                      ? "Deploying..."
                      : "Deploy Directive Vector ⚡"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

type ContextEntry = { origin: string; timestamp: string; log: string };

function TaskCard({
  task,
  isAdmin,
  onApprove,
  isRunning = false,
  colorFn,
}: {
  task: any;
  isAdmin: boolean;
  onApprove?: () => void;
  isRunning?: boolean;
  colorFn: (lvl: string) => string;
}) {
  const localFlag =
    (task.metadata as any)?.isHyperLocal || task.category?.includes("local");
  const contextStack: ContextEntry[] = (task.contextStack as ContextEntry[]) ?? [];

  return (
    <Card className="border border-black bg-white dark:bg-zinc-950 font-mono tracking-tight shadow-sm rounded-none">
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-center text-[10px] border-b border-zinc-200 pb-1.5 uppercase text-zinc-400 font-bold">
          <span>GAP: {task.category?.replace(/_/g, " ")}</span>
          <span>BD-LOG-{task.id}</span>
        </div>

        <div>
          <h4 className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
            {isRunning && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            )}
            {task.title}
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1 justify-between items-center">
          <div className="flex gap-1.5">
            <Badge
              variant="outline"
              className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-2 ${colorFn(task.priority)}`}
            >
              {task.priority}
            </Badge>
            {localFlag && (
              <Badge className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none bg-amber-400 text-black hover:bg-amber-400 border border-black flex items-center gap-0.5">
                📍 North Marin
              </Badge>
            )}
          </div>

          {/* Context stack history dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-[9px] font-bold uppercase tracking-tighter gap-0.5 px-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <History className="h-3 w-3" />
                Log ({contextStack.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="font-mono rounded-none border-2 border-black max-w-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
              <DialogHeader className="border-b-2 border-black pb-2">
                <DialogTitle className="text-sm font-black uppercase flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-emerald-500" />
                  Context Stack: BD-LOG-{task.id}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 my-2 text-xs max-h-[40vh] overflow-y-auto pr-1">
                {contextStack.length === 0 ? (
                  <p className="text-zinc-400 text-center py-4">
                    No context entries.
                  </p>
                ) : (
                  contextStack.map((ctx, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1"
                    >
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 uppercase font-bold border-b border-zinc-200 dark:border-zinc-800 pb-0.5">
                        <span>{ctx.origin}</span>
                        <span>{new Date(ctx.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {ctx.log}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {task.status !== "completed" && isAdmin && (
          <div className="pt-2 border-t border-dashed border-zinc-200">
            {task.requiresApproval && task.status === "pending" ? (
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-[10px] font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-none h-7"
                onClick={onApprove}
              >
                ⚠️ Approve & Execute
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-[10px] font-bold uppercase tracking-wider border-black hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 rounded-none h-7"
                onClick={onApprove}
              >
                Advance Status →
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
