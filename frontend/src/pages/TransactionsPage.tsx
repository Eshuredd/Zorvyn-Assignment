import { useState, useMemo } from "react";
import { mockTransactions } from "@/services/mockData";
import { Transaction } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search } from "lucide-react";

const PAGE_SIZE = 8;
const categories = ["Food", "Transport", "Entertainment", "Utilities", "Salary", "Freelance", "Shopping", "Healthcare"];
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function formatShortDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function TransactionsPage() {
  const { hasAccess } = useAuth();
  const isAdmin = hasAccess("Admin");

  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [form, setForm] = useState({ description: "", amount: "", type: "expense" as "income" | "expense", category: "Food", date: "" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (q && !t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, search]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const resetForm = () => {
    setForm({ description: "", amount: "", type: "expense", category: "Food", date: "" });
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({ description: t.description, amount: String(t.amount), type: t.type, category: t.category, date: t.date });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description || !form.amount || !form.date) {
      toast.error("Please fill all fields");
      return;
    }
    if (editing) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, ...form, amount: Number(form.amount) } : t)),
      );
      toast.success("Record updated");
    } else {
      const newTxn: Transaction = { id: `txn-${Date.now()}`, ...form, amount: Number(form.amount), createdBy: "admin" };
      setTransactions((prev) => [newTxn, ...prev]);
      toast.success("Record added");
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Record deleted");
  };

  return (
    <>
      <header className="page-shell-header">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Financial Records</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
        </p>
      </header>

      <div className="page-shell-body space-y-6">
        <Card className="rounded-xl border-border p-5 shadow-sm">
          <div className="ledger-filters-bar mb-0 border-0 pb-0">
            <div className="relative min-w-[200px] flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search description or category…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="h-9 rounded-md border-border pl-8 text-[13px]"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-md border-border text-[13px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCategory}
              onValueChange={(v) => {
                setFilterCategory(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="h-9 min-w-[140px] rounded-md border-border text-[13px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openAdd}
                    className="h-9 rounded-md bg-primary px-3 text-[13px] font-medium hover:bg-[#154d3a]"
                  >
                    + Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl border-border">
                  <DialogHeader>
                    <DialogTitle className="text-[17px] font-semibold tracking-tight">
                      {editing ? "Edit Record" : "New Financial Record"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="auth-form-label">Description</Label>
                      <Input
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="auth-form-label">Amount ($)</Label>
                        <Input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          className="border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="auth-form-label">Date</Label>
                        <Input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="border-border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="auth-form-label">Type</Label>
                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "income" | "expense" })}>
                          <SelectTrigger className="border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="auth-form-label">Category</Label>
                        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                          <SelectTrigger className="border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
                      <Button variant="outline" className="rounded-md border-border" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="rounded-md bg-primary hover:bg-[#154d3a]" onClick={handleSave}>
                        {editing ? "Save Changes" : "Add Record"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-[22px]">📋</div>
              <p className="text-[15px] font-medium text-foreground">No records found</p>
              <p className="mt-1 max-w-[300px] text-[13px] text-muted-foreground">Try adjusting your filters or add a new record.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-10 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </TableHead>
                    {isAdmin && (
                      <TableHead className="h-10 px-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {" "}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((txn) => (
                    <TableRow key={txn.id} className="border-border/80 hover:bg-secondary/60">
                      <TableCell className="whitespace-nowrap px-3 py-3 font-mono text-[13px]">
                        {formatShortDate(txn.date)}
                      </TableCell>
                      <TableCell className="max-w-[220px] px-3 py-3">
                        <div className="font-medium leading-snug text-foreground">{txn.description}</div>
                        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          Entry · {txn.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[12px] text-muted-foreground">{txn.category}</TableCell>
                      <TableCell className="px-3 py-3">
                        <span className={txn.type === "income" ? "ledger-badge-income" : "ledger-badge-expense"}>
                          {txn.type}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`px-3 py-3 font-mono text-[13px] font-medium ${
                          txn.type === "income" ? "text-[hsl(146_61%_26%)]" : "text-foreground"
                        }`}
                      >
                        {txn.type === "income" ? "+" : "−"}
                        {fmt(txn.amount)}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <span className="ledger-badge-active">confirmed</span>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="px-3 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 rounded-md border-border px-2.5 text-[12px]"
                              onClick={() => openEdit(txn)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 rounded-md border-red-200 bg-[hsl(6_57%_46%/0.08)] px-2.5 text-[12px] text-destructive hover:bg-[hsl(6_57%_46%/0.15)]"
                              onClick={() => handleDelete(txn.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={`rounded-md border px-2.5 py-1 font-sans text-[12px] transition-colors ${
                      page === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/80 bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <span className="ml-2 text-[12px] text-muted-foreground">{filtered.length} total</span>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
