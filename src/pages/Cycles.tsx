import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  RotateCcw,
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  Clock,
  PauseCircle,
  Archive,
} from "lucide-react";
import { useState } from "react";

const phaseIcons: Record<string, React.ReactNode> = {
  ideation: <Clock className="h-4 w-4" />,
  design: <RotateCcw className="h-4 w-4" />,
  review: <CheckCircle2 className="h-4 w-4" />,
  production: <TrendingUp className="h-4 w-4" />,
  marketing: <DollarSign className="h-4 w-4" />,
  complete: <CheckCircle2 className="h-4 w-4" />,
};

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  draft: { variant: "outline", icon: <Clock className="h-3 w-3" /> },
  active: { variant: "default", icon: <RotateCcw className="h-3 w-3" /> },
  paused: { variant: "secondary", icon: <PauseCircle className="h-3 w-3" /> },
  completed: { variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  archived: { variant: "outline", icon: <Archive className="h-3 w-3" /> },
};

export default function Cycles() {
  const { data: cycles } = trpc.dashboard.cycles.useQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const formatCurrency = (val: string | null) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val || "0"));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Design Cycles</h1>
            <p className="text-sm text-muted-foreground">
              Manage your POD design and production cycles.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Cycle</DialogTitle>
                <DialogDescription>Start a new design cycle for your next product drop.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Cycle Name</Label>
                  <Input placeholder="e.g. Summer Collection 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input placeholder="e.g. Chase the sun, wear the daze" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Revenue</Label>
                    <Input type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success("Cycle created!"); setCreateOpen(false); }}>
                  Create Cycle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold">{cycles?.filter((c) => c.status === "active").length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-2xl font-bold">{cycles?.filter((c) => c.status === "completed").length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                  cycles?.reduce((sum, c) => sum + parseFloat(c.actualRevenue || "0"), 0) || 0
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Avg. Progress</span>
              </div>
              <p className="text-2xl font-bold">
                {cycles && cycles.length > 0
                  ? Math.round(
                      cycles.reduce(
                        (sum, c) =>
                          sum +
                          (parseFloat(c.actualRevenue || "0") /
                            parseFloat(c.targetRevenue || "1")) *
                            100,
                        0
                      ) / cycles.length
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles?.map((cycle) => {
                  const progress = cycle.targetRevenue
                    ? (parseFloat(cycle.actualRevenue || "0") / parseFloat(cycle.targetRevenue)) * 100
                    : 0;
                  const cfg = statusConfig[cycle.status] || statusConfig.draft;
                  return (
                    <TableRow key={cycle.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{cycle.name}</p>
                          <p className="text-xs text-muted-foreground">{cycle.slogan}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {phaseIcons[cycle.currentPhase] || <Clock className="h-4 w-4" />}
                          <span className="text-sm capitalize">{cycle.currentPhase}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1 text-[10px] capitalize">
                          {cfg.icon}
                          {cycle.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{formatCurrency(cycle.actualRevenue)}</span>
                          <span className="text-muted-foreground"> / {formatCurrency(cycle.targetRevenue)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 w-40">
                          <Progress value={Math.min(progress, 100)} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-10 text-right">{Math.round(progress)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!cycles || cycles.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No cycles yet. Create your first design cycle!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
