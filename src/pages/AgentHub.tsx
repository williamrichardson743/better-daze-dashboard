import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bot,
  Loader2,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CircleDot,
  Send,
  MessageSquare,
  Zap,
  User,
  Radio,
} from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  online: { color: "text-green-500", icon: <Radio className="h-3 w-3" /> },
  offline: { color: "text-gray-500", icon: <CircleDot className="h-3 w-3" /> },
  busy: { color: "text-amber-500", icon: <Zap className="h-3 w-3" /> },
  idle: { color: "text-blue-500", icon: <Clock className="h-3 w-3" /> },
};

const taskStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
  in_progress: { variant: "secondary", icon: <Zap className="h-3 w-3" /> },
  completed: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  blocked: { variant: "outline", icon: <AlertTriangle className="h-3 w-3" /> },
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-blue-500/10 text-blue-400",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  ai_agent: { icon: <Bot className="h-4 w-4" />, color: "text-purple-400" },
  human: { icon: <User className="h-4 w-4" />, color: "text-green-400" },
  system: { icon: <Zap className="h-4 w-4" />, color: "text-yellow-400" },
};

export default function AgentHub() {
  const utils = trpc.useUtils();
  const { data: agents, isLoading: loadingAgents } = trpc.agent.list.useQuery();
  const { data: tasks, isLoading: loadingTasks } = trpc.agent.tasks.list.useQuery();
  const { data: messages, isLoading: loadingMessages } = trpc.agent.messages.list.useQuery();

  const createAgent = trpc.agent.register.useMutation({
    onSuccess: () => { utils.agent.list.invalidate(); toast.success("Agent registered!"); },
  });
  const createTask = trpc.agent.tasks.create.useMutation({
    onSuccess: () => { utils.agent.tasks.list.invalidate(); toast.success("Task created!"); },
  });
  const updateTask = trpc.agent.tasks.update.useMutation({
    onSuccess: () => { utils.agent.tasks.list.invalidate(); },
  });
  const sendMessage = trpc.agent.messages.send.useMutation({
    onSuccess: () => { utils.agent.messages.list.invalidate(); },
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskCategory, setNewTaskCategory] = useState<"immediate" | "short_term" | "deferred">("short_term");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentType, setNewAgentType] = useState<"ai_agent" | "human" | "system">("ai_agent");
  const [newMsg, setNewMsg] = useState("");
  const [activeTab, setActiveTab] = useState("agents");

  const pendingCount = (tasks || []).filter((t) => t.status === "pending").length;
  const inProgressCount = (tasks || []).filter((t) => t.status === "in_progress").length;
  const completedCount = (tasks || []).filter((t) => t.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Hub</h1>
            <p className="text-sm text-muted-foreground">
              Command center for all AI agents and tasks. Register agents, assign work, track progress.
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Bot className="h-3 w-3" />
            {agents?.length || 0} agents
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-muted-foreground">Agents</span>
              </div>
              <p className="text-2xl font-bold">{agents?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Done</span>
              </div>
              <p className="text-2xl font-bold">{completedCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Zap className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* AGENTS TAB */}
          <TabsContent value="agents" className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Register New Agent</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Agent name (e.g., Manus, Claude)"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value as any)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="ai_agent">AI Agent</option>
                  <option value="human">Human</option>
                  <option value="system">System</option>
                </select>
                <Button
                  onClick={() => {
                    if (!newAgentName) { toast.error("Enter a name"); return; }
                    createAgent.mutate({ name: newAgentName, type: newAgentType, capabilities: [] });
                    setNewAgentName("");
                  }}
                  disabled={createAgent.isPending}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Register
                </Button>
              </div>
            </Card>

            {loadingAgents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(agents || []).map((agent) => {
                  const tConfig = typeConfig[agent.type] || typeConfig.ai_agent;
                  const sConfig = statusConfig[agent.status] || statusConfig.idle;
                  return (
                    <Card key={agent.id} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${tConfig.color}`}>
                          {tConfig.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{agent.name}</p>
                          <div className="flex items-center gap-1">
                            <span className={sConfig.color}>{sConfig.icon}</span>
                            <span className={`text-xs capitalize ${sConfig.color}`}>{agent.status}</span>
                          </div>
                        </div>
                      </div>
                      {agent.capabilities && Array.isArray(agent.capabilities) && (agent.capabilities as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(agent.capabilities as string[]).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-[10px]">{cap}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Last active: {agent.lastActive ? new Date(agent.lastActive).toLocaleTimeString() : "Never"}
                      </p>
                    </Card>
                  );
                })}
                {(!agents || agents.length === 0) && (
                  <div className="text-center py-12 col-span-full">
                    <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No agents registered yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks" className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Create New Task</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Input
                  placeholder="Description..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
                <div className="flex gap-3">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="short_term">Short-Term</option>
                    <option value="deferred">Deferred</option>
                  </select>
                  <Button
                    onClick={() => {
                      if (!newTaskTitle) { toast.error("Enter a title"); return; }
                      createTask.mutate({
                        title: newTaskTitle,
                        description: newTaskDesc || undefined,
                        priority: newTaskPriority,
                        category: newTaskCategory,
                      });
                      setNewTaskTitle("");
                      setNewTaskDesc("");
                    }}
                    disabled={createTask.isPending}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Create Task
                  </Button>
                </div>
              </div>
            </Card>

            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {(tasks || []).map((task) => {
                  const sConfig = taskStatusConfig[task.status] || taskStatusConfig.pending;
                  return (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">{task.title}</p>
                            <Badge variant={sConfig.variant} className="text-[10px] gap-1">
                              {sConfig.icon}
                              {task.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && <p className="text-xs text-muted-foreground mb-2">{task.description}</p>}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground capitalize">{task.category?.replace("_", "-")}</span>
                            {task.assignedAgentId && <span className="text-[10px] text-blue-400">Assigned to #{task.assignedAgentId}</span>}
                            {task.dueDate && <span className="text-[10px] text-amber-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {task.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => updateTask.mutate({ id: task.id, status: "in_progress" })}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                          {task.status === "in_progress" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => updateTask.mutate({ id: task.id, status: "completed" })}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                Done
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px]"
                                onClick={() => updateTask.mutate({ id: task.id, status: "failed" })}
                              >
                                <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                Fail
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!tasks || tasks.length === 0) && (
                  <div className="text-center py-12">
                    <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tasks yet. Create your first one!</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Send Message</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Broadcast a message to all agents..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    if (!newMsg) { toast.error("Enter a message"); return; }
                    sendMessage.mutate({
                      fromAgentId: 1,
                      content: newMsg,
                      messageType: "broadcast",
                    });
                    setNewMsg("");
                    toast.success("Message sent!");
                  }}
                  disabled={sendMessage.isPending}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Send
                </Button>
              </div>
            </Card>

            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {(messages || []).map((msg) => (
                  <Card key={msg.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">Agent #{msg.fromAgentId}</span>
                          <Badge variant="outline" className="text-[10px]">{msg.messageType.replace("_", " ")}</Badge>
                          {msg.taskId && <span className="text-[10px] text-muted-foreground">Task #{msg.taskId}</span>}
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!messages || messages.length === 0) && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No messages yet.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
