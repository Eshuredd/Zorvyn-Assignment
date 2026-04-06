import { useState } from "react";
import { mockUsers } from "@/services/mockData";
import { User, Role } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function avClass(tone?: User["avatarTone"]) {
  switch (tone) {
    case "blue":
      return "ledger-avatar-blue";
    case "purple":
      return "ledger-avatar-purple";
    case "orange":
      return "ledger-avatar-orange";
    default:
      return "ledger-avatar-green";
  }
}

function roleBadgeClass(role: Role) {
  switch (role) {
    case "Admin":
      return "ledger-badge-admin";
    case "Analyst":
      return "ledger-badge-analyst";
    default:
      return "ledger-badge-viewer";
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("Viewer");

  const changeRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  };

  const toggleActive = (id: string, checked: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: checked } : u)));
    toast.success(checked ? "User active" : "User inactive");
  };

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleAddUser = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const tones: User["avatarTone"][] = ["green", "blue", "purple", "orange"];
    const u: User = {
      id: `u-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      isActive: true,
      avatarTone: tones[users.length % 4],
    };
    setUsers((prev) => [...prev, u]);
    setAddOpen(false);
    setNewName("");
    setNewEmail("");
    setNewRole("Viewer");
    toast.success("User created");
  };

  return (
    <>
      <header className="page-shell-header">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">User Management</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Manage access roles and account status</p>
      </header>

      <div className="page-shell-body">
        <Card className="rounded-xl border-border p-5 shadow-sm">
          <div className="ledger-filters-bar mb-4 justify-end border-0 pb-4">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-9 rounded-md bg-primary text-[13px] hover:bg-[#154d3a]">+ Add User</Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-border">
                <DialogHeader>
                  <DialogTitle className="text-[17px] font-semibold tracking-tight">Add User</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="auth-form-label">Full Name</Label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="border-border" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <Label className="auth-form-label">Email</Label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="border-border"
                      placeholder="jane@finco.io"
                    />
                  </div>
                  <div>
                    <Label className="auth-form-label">Role</Label>
                    <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                      <SelectTrigger className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
                    <Button variant="outline" className="rounded-md border-border" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="rounded-md bg-primary hover:bg-[#154d3a]" onClick={handleAddUser}>
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">User</TableHead>
                <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email</TableHead>
                <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Role</TableHead>
                <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-border/80 hover:bg-secondary/60">
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("ledger-avatar", avClass(user.avatarTone))}>{initials(user.name)}</div>
                      <span className="text-[13px] font-medium text-foreground">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-[13px] text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="px-3 py-3">
                    <span className={roleBadgeClass(user.role)}>
                      {user.role.charAt(0).toUpperCase()}
                      {user.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <span className={user.isActive ? "ledger-badge-active" : "ledger-badge-inactive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={user.role} onValueChange={(v) => changeRole(user.id, v as Role)}>
                        <SelectTrigger className="h-8 w-[100px] rounded-md border-border text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(c) => toggleActive(user.id, c)}
                        className="h-5 w-9 data-[state=checked]:bg-primary [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
