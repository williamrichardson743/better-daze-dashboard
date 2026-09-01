import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  CheckSquare,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

const priorityConfig = {
  critical: { color: "text-red-600 bg-red-50 border-red-200", icon: <ArrowUp className="h-3 w-3" /> },
  high: { color: "text-amber-600 bg-amber-50 border-amber-200", icon: <ArrowUp className="h-3 w-3" /> },
  medium: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: <ArrowRight className="h-3 w-3" /> },
  low: { color: "text-muted-foreground bg-muted border-border", icon: <ArrowDown className="h-3 w-3" /> },
};

const sectionConfig = {
  immediate: { label: "Immediate", color: "bg-red-500", desc: "Do right now" },
  short_term: { label: "Short-Term", color: "bg-amber-500", desc: "This week" },
  deferred: { label: "Deferred", color: "bg-blue-500", desc: "Future sprint" },
};

export default function Checklist() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.operations.actions.list.useQuery();
  const createAction = trpc.operations.actions.create.useMutation({
    onSuccess: () => {
      utils.operations.actions.list.invalidate();
      toast.success("Action item added!");
    },
  });
  const toggleComplete = trpc.operations.actions.toggleComplete.useMutation({
    onSuccess: () => {
      utils.operations.actions.list.invalidate();
    },
  });
  const deleteAction = trpc.operations.actions.delete.useMutation({
    onSuccess: () => {
      utils.operations.actions.list.invalidate();
      toast.success("Item deleted");
    },
  });

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSection, setNewSection] = useState<"immediate" | "short_term" | "deferred">("immediate");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) {
      toast.error("Enter a title");
      return;
    }
    createAction.mutate({
      title: newTitle,
      description: newDescription || undefined,
      section: newSection,
      priority: newPriority,
    });
    setNewTitle("");
    setNewDescription("");
    setShowForm(false);
  };

  const immediateItems = (items || []).filter((i) => i.section === "immediate");
  const shortTermItems = (items || []).filter((i) => i.section === "short_term");
  const deferredItems = (items || []).filter((i) => i.section === "deferred");
  const completedCount = (items || []).filter((i) => i.status === "completed").length;
  const totalCount = items?.length || 0;

  const renderItems = (sectionItems: typeof items) => {
    if (!sectionItems || sectionItems.length === 0) {
      return <p className="text-sm text-muted-foreground py-4 text-center">No items yet</p>;
    }

    return (
      <div className="space-y-2">
        {sectionItems.map((item) => {
          const isCompleted = item.status === "completed";
          const pConfig = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.medium;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                isCompleted ? "bg-muted/30 opacity-60" : "bg-card hover:border-primary/20"
              }`}
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={(checked) => {
                  toggleComplete.mutate({ id: item.id, isCompleted: checked === true });
                }}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </p>
                  <Badge variant="outline" className={`text-[10px] gap-1 ${pConfig.color}`}>
                    {pConfig.icon}
                    {item.priority}
                  </Badge>
                </div>
                {item.description && (
                  <p className={`text-xs mt-1 ${isCompleted ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {item.dueDate && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {isCompleted && item.completedAt && (
                    <span className="text-[10px] text-green-600 flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      Done
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => deleteAction.mutate({ id: item.id })}
                disabled={deleteAction.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Checklist</h1>
            <p className="text-sm text-muted-foreground">
              Track action items across Immediate, Short-Term, and Deferred priorities.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckSquare className="h-3 w-3" />
              {completedCount}/{totalCount}
            </Badge>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">New Action Item</h3>
            <div className="space-y-3">
              <Input
                placeholder="Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                placeholder="Description (optional)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="short_term">Short-Term</option>
                    <option value="deferred">Deferred</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={createAction.isPending} size="sm">
                  {createAction.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Three Sections */}
        {!isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">
            {(["immediate", "short_term", "deferred"] as const).map((section) => {
              const config = sectionConfig[section];
              const sectionItems = section === "immediate" ? immediateItems : section === "short_term" ? shortTermItems : deferredItems;
              const sectionCompleted = sectionItems.filter((i) => i.status === "completed").length;

              return (
                <Card key={section} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
                      <CardTitle className="text-sm">{config.label}</CardTitle>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {sectionCompleted}/{sectionItems.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{config.desc}</p>
                  </CardHeader>
                  <CardContent>
                    {renderItems(sectionItems)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state when no items at all */}
        {!isLoading && totalCount === 0 && (
          <Card className="p-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No action items yet. Start by adding one!</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
