import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users,
  Settings,
  Shield,
  Key,
  UserCog,
  Search,
  Edit3,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  Globe,
  CheckCircle2,
  XCircle,
  Save,
  RotateCcw,
  Lock,
  Smartphone,
  Fingerprint,
  AlertTriangle,
} from "lucide-react";

/* ─────────────── USER MANAGEMENT ─────────────── */
function UserManagement() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.list.useQuery();
  const updateUser = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("User updated");
    },
  });
  const deleteUser = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("User deleted");
    },
  });

  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: "user" | "admin" | "viewer"; status: "active" | "inactive" }>({ name: "", email: "", role: "user", status: "active" });

  const filtered = users?.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: NonNullable<typeof users>[number]) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role as "user" | "admin" | "viewer",
      status: (user.status as "active" | "inactive") || "active",
    });
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser.mutate({ id: editingUser, ...editForm });
      setEditingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {editingUser === user.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-7 text-sm"
                            />
                          ) : (
                            <p className="text-sm font-medium">{user.name || "Unnamed"}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.role}
                          onValueChange={(v) => setEditForm({ ...editForm, role: v as any })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className="text-[10px] capitalize"
                        >
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.status}
                          onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}
                        >
                          <SelectTrigger className="h-7 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={user.status === "active" ? "secondary" : "outline"}
                          className="text-[10px] capitalize"
                        >
                          {user.status || "active"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastSignInAt
                        ? new Date(user.lastSignInAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingUser === user.id ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingUser(null)}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(user)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => deleteUser.mutate({ id: user.id })}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── PREFERENCES ─────────────── */
function PreferencesPanel() {
  const utils = trpc.useUtils();
  const { data: preferences } = trpc.admin.preferences.get.useQuery();
  const updatePreferences = trpc.admin.preferences.update.useMutation({
    onSuccess: () => {
      utils.admin.preferences.get.invalidate();
      toast.success("Preferences saved");
    },
  });

  const [form, setForm] = useState({
    theme: "auto" as const,
    emailNotifications: true,
    inAppNotifications: true,
    notificationFrequency: "daily" as const,
    itemsPerPage: 20,
    defaultView: "grid" as const,
    autoPublish: false,
    cycleFrequency: "weekly" as const,
    companyName: "Better Daze",
    primaryColor: "#6366f1",
  });

  // Sync form with loaded preferences
  useState(() => {
    if (preferences) {
      setForm({
        theme: preferences.theme as any,
        emailNotifications: preferences.emailNotifications ?? true,
        inAppNotifications: preferences.inAppNotifications ?? true,
        notificationFrequency: preferences.notificationFrequency as any,
        itemsPerPage: preferences.itemsPerPage || 20,
        defaultView: preferences.defaultView as any,
        autoPublish: preferences.autoPublish ?? false,
        cycleFrequency: preferences.cycleFrequency as any,
        companyName: preferences.companyName || "Better Daze",
        primaryColor: preferences.primaryColor || "#6366f1",
      });
    }
  });

  const handleSave = () => {
    updatePreferences.mutate(form);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={form.theme} onValueChange={(v) => setForm({ ...form, theme: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default View</Label>
              <Select value={form.defaultView} onValueChange={(v) => setForm({ ...form, defaultView: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Items Per Page</Label>
            <Input
              type="number"
              min={5}
              max={100}
              value={form.itemsPerPage}
              onChange={(e) => setForm({ ...form, itemsPerPage: parseInt(e.target.value) || 20 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Control how and when you receive updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={form.emailNotifications}
              onCheckedChange={(v) => setForm({ ...form, emailNotifications: v })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-xs text-muted-foreground">Show notifications in the dashboard</p>
            </div>
            <Switch
              checked={form.inAppNotifications}
              onCheckedChange={(v) => setForm({ ...form, inAppNotifications: v })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={form.notificationFrequency}
              onValueChange={(v) => setForm({ ...form, notificationFrequency: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cycle Settings</CardTitle>
          <CardDescription>Configure default behavior for design cycles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Publish Products</Label>
              <p className="text-xs text-muted-foreground">Automatically publish approved designs</p>
            </div>
            <Switch
              checked={form.autoPublish}
              onCheckedChange={(v) => setForm({ ...form, autoPublish: v })}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Default Cycle Frequency</Label>
            <Select
              value={form.cycleFrequency}
              onValueChange={(v) => setForm({ ...form, cycleFrequency: v as any })}
            >
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>Customize your dashboard branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="h-9 w-16 rounded border border-border cursor-pointer"
              />
              <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm({ ...form })}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

/* ─────────────── SECURITY ─────────────── */
function SecuritySettings() {
  const utils = trpc.useUtils();
  const { data: sessions } = trpc.admin.security.getSessions.useQuery();
  const { data: apiKeys } = trpc.admin.security.getApiKeys.useQuery();
  const { data: loginHistory } = trpc.admin.security.getLoginHistory.useQuery();
  const logoutSession = trpc.admin.security.logoutSession.useMutation({
    onSuccess: () => utils.admin.security.getSessions.invalidate(),
  });
  const generateApiKey = trpc.admin.security.generateApiKey.useMutation({
    onSuccess: () => {
      utils.admin.security.getApiKeys.invalidate();
      toast.success("API key generated");
    },
  });
  const revokeApiKey = trpc.admin.security.revokeApiKey.useMutation({
    onSuccess: () => {
      utils.admin.security.getApiKeys.invalidate();
      toast.success("API key revoked");
    },
  });

  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Authenticator App</p>
                <p className="text-xs text-muted-foreground">Use Google Authenticator or similar</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Passkeys</p>
                <p className="text-xs text-muted-foreground">Use biometrics or security keys</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </CardTitle>
          <CardDescription>Manage access keys for external integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>New Key Name</Label>
              <Input
                placeholder="e.g. Shopify Integration"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                if (!newKeyName) return toast.error("Enter a key name");
                generateApiKey.mutate(
                  { name: newKeyName },
                  {
                    onSuccess: (data) => {
                      setGeneratedKey(data.key);
                      setNewKeyName("");
                    },
                  }
                );
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>

          {generatedKey && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Copy this key now — it won't be shown again
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-white px-3 py-2 text-xs font-mono dark:bg-black">
                  {generatedKey}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {apiKeys?.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {showKey === key.id ? key.keyHash : `${key.keyHash.slice(0, 8)}············`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowKey(showKey === key.id ? null : key.id)}>
                    {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => revokeApiKey.mutate({ id: key.id })}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
            {(!apiKeys || apiKeys.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No API keys yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active login sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions?.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{session.userAgent?.slice(0, 30) || "Unknown"}...</p>
                    <p className="text-xs text-muted-foreground">{session.ipAddress || "Unknown IP"}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => logoutSession.mutate({ id: session.id })}>
                  <LogOut className="mr-2 h-3 w-3" />
                  Revoke
                </Button>
              </div>
            ))}
            {(!sessions || sessions.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No active sessions.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Login History
          </CardTitle>
          <CardDescription>Recent account access activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px]">
            <div className="space-y-1">
              {loginHistory?.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        record.status === "success" ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      {record.status === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{record.ipAddress || "Unknown IP"}</p>
                      <p className="text-xs text-muted-foreground">{record.userAgent?.slice(0, 40)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={record.status === "success" ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {record.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!loginHistory || loginHistory.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No login history.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── ROLE MANAGEMENT ─────────────── */
function RoleManagement() {
  const utils = trpc.useUtils();
  const { data: rolesWithPerms, isLoading } = trpc.admin.roles.list.useQuery();
  const updatePermissions = trpc.admin.roles.updatePermissions.useMutation({
    onSuccess: () => {
      utils.admin.roles.list.invalidate();
      toast.success("Permissions updated");
    },
  });

  const resources = ["products", "orders", "cycles", "users", "settings", "analytics", "social"] as const;
  const actions = ["create", "read", "update", "delete"] as const;

  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [permState, setPermState] = useState<Record<string, boolean>>({});

  const startEditing = (role: NonNullable<typeof rolesWithPerms>[number]) => {
    setEditingRole(role.id);
    const state: Record<string, boolean> = {};
    for (const res of resources) {
      for (const act of actions) {
        const perm = role.permissions?.find((p: typeof role.permissions[number]) => p.resource === res && p.action === act);
        state[`${res}-${act}`] = perm?.granted ?? false;
      }
    }
    setPermState(state);
  };

  const savePermissions = () => {
    if (!editingRole) return;
    const permissions = [];
    for (const res of resources) {
      for (const act of actions) {
        permissions.push({
          resource: res,
          action: act,
          granted: permState[`${res}-${act}`] ?? false,
        });
      }
    }
    updatePermissions.mutate({ roleId: editingRole, permissions });
    setEditingRole(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles & Permissions</CardTitle>
          <CardDescription>Define what each role can do in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading roles...
                  </TableCell>
                </TableRow>
              ) : (
                rolesWithPerms?.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={role.isCustom ? "secondary" : "outline"} className="text-[10px]">
                        {role.isCustom ? "Custom" : "System"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => startEditing(role)}>
                        <Edit3 className="mr-2 h-3 w-3" />
                        Edit Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permission Matrix Dialog */}
      <Dialog open={editingRole !== null} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Toggle permissions for the selected role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_repeat(4,auto)] gap-2 items-center text-xs font-medium text-muted-foreground uppercase">
              <span>Resource</span>
              <span className="text-center w-16">Create</span>
              <span className="text-center w-16">Read</span>
              <span className="text-center w-16">Update</span>
              <span className="text-center w-16">Delete</span>
            </div>
            <Separator />
            {resources.map((resource) => (
              <div key={resource} className="grid grid-cols-[1fr_repeat(4,auto)] gap-2 items-center">
                <span className="text-sm font-medium capitalize">{resource}</span>
                {actions.map((action) => (
                  <Switch
                    key={action}
                    checked={permState[`${resource}-${action}`] ?? false}
                    onCheckedChange={(v) =>
                      setPermState((prev) => ({ ...prev, [`${resource}-${action}`]: v }))
                    }
                    className="justify-self-center"
                  />
                ))}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button onClick={savePermissions}>
              <Save className="mr-2 h-4 w-4" />
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────── MAIN ADMIN PAGE ─────────────── */
export default function AdminSettings() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, configure preferences, secure your account, and control access.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[520px]">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesPanel />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
