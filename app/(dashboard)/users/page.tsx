
"use client";

import * as React from "react";
import { Columns3, Copy, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { userRoleBadgeClass, userStatusBadgeClass } from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useToast } from "@/components/shared/toast-provider";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users as mockUsers } from "@/lib/mock/users";
import type { User, UserRole, UserStatus } from "@/lib/types/user";

type ColumnVisibility = {
  name: boolean;
  email: boolean;
  role: boolean;
  warehouseLocation: boolean;
  status: boolean;
};

type FilterState = {
  status: "all" | UserStatus;
  role: "all" | UserRole;
  warehouseLocation: string;
  emailDomain: string;
};

type FormState = {
  name: string;
  email: string;
  role: UserRole;
  warehouseLocation: string;
  status: UserStatus;
};

const defaultFilters: FilterState = {
  status: "all",
  role: "all",
  warehouseLocation: "all",
  emailDomain: ""
};

const defaultForm: FormState = {
  name: "",
  email: "",
  role: "warehouse-operator",
  warehouseLocation: "",
  status: "active"
};

const roleLabel: Record<UserRole, string> = {
  admin: "Admin",
  "admin-eval": "Admin Eval",
  "warehouse-operator": "Warehouse Operator"
};

const statusLabel: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive"
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "U";
};

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<FormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = React.useState<User | null>(null);
  const [resetPasswordCandidate, setResetPasswordCandidate] = React.useState<User | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:users",
    { name: true, email: true, role: true, warehouseLocation: true, status: true }
  );

  const selectedUser = React.useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  const warehouseOptions = React.useMemo(
    () => Array.from(new Set(users.map((user) => user.warehouseLocation).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [users]
  );

  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return users.filter((user) => {
      if (query) {
        const haystack = [user.name, user.email, user.warehouseLocation, roleLabel[user.role]].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.status !== "all" && user.status !== filters.status) return false;
      if (filters.role !== "all" && user.role !== filters.role) return false;
      if (filters.warehouseLocation !== "all" && user.warehouseLocation !== filters.warehouseLocation) return false;
      if (filters.emailDomain.trim() && !user.email.toLowerCase().includes(`@${filters.emailDomain.toLowerCase().trim()}`)) return false;
      return true;
    });
  }, [filters, searchQuery, users]);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.status !== "all" ? 1 : 0) +
      (filters.role !== "all" ? 1 : 0) +
      (filters.warehouseLocation !== "all" ? 1 : 0) +
      (filters.emailDomain.trim() ? 1 : 0),
    [filters]
  );

  const kpi = React.useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === "active").length;
    const inactive = users.filter((user) => user.status === "inactive").length;
    const warehouseOperators = users.filter((user) => user.role === "warehouse-operator").length;
    return { total, active, inactive, warehouseOperators };
  }, [users]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) setDraftFilters(filters);
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedUsers = filteredUsers.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    (visibleColumns.name ? 1 : 0) +
    (visibleColumns.email ? 1 : 0) +
    (visibleColumns.role ? 1 : 0) +
    (visibleColumns.warehouseLocation ? 1 : 0) +
    (visibleColumns.status ? 1 : 0) +
    1;

  const resetForm = () => {
    setFormMode("create");
    setEditingId(null);
    setFormValues(defaultForm);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setFormMode("edit");
    setEditingId(user.id);
    setFormValues({
      name: user.name,
      email: user.email,
      role: user.role,
      warehouseLocation: user.warehouseLocation,
      status: user.status
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openDetail = (user: User) => {
    setSelectedUserId(user.id);
    setDetailOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setFiltersOpen(false);
  };

  const isDuplicateEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    return users.some((user) => user.email.toLowerCase() === normalized && user.id !== editingId);
  };

  const saveUser = () => {
    const name = formValues.name.trim();
    const email = formValues.email.trim().toLowerCase();

    if (!name || !email) {
      setFormError("Name and Email are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setFormError("Email format is invalid.");
      return;
    }

    if (isDuplicateEmail(email)) {
      setFormError("Email must be unique.");
      return;
    }

    if (formValues.role === "warehouse-operator" && !formValues.warehouseLocation.trim()) {
      setFormError("Warehouse Location is required for Warehouse Operator.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name,
                email,
                role: formValues.role,
                warehouseLocation: formValues.warehouseLocation.trim(),
                status: formValues.status,
                updatedAt: now
              }
            : user
        )
      );
      toast({ title: "User Updated", description: `${email} updated successfully.`, variant: "success" });
    } else {
      const maxId = users.reduce((max, user) => {
        const parsed = Number(user.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const newUser: User = {
        id: `USR-${String(maxId + 1).padStart(3, "0")}`,
        name,
        email,
        role: formValues.role,
        warehouseLocation: formValues.warehouseLocation.trim(),
        status: formValues.status,
        lastLoginAt: formValues.status === "active" ? `${now} 09:00` : undefined,
        createdAt: now,
        updatedAt: now
      };

      setUsers((current) => [newUser, ...current]);
      toast({ title: "User Created", description: `${email} added successfully.`, variant: "success" });
    }

    setFormOpen(false);
    resetForm();
  };

  const setUserStatus = (user: User, status: UserStatus) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );

    toast({
      title: "Status Updated",
      description: `${user.name} is now ${statusLabel[status].toLowerCase()}.`,
      variant: "info"
    });
  };

  const setUserRole = (user: User, role: UserRole) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              role,
              warehouseLocation: role === "warehouse-operator" ? item.warehouseLocation : item.warehouseLocation,
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : item
      )
    );

    toast({
      title: "Role Updated",
      description: `${user.name} role changed to ${roleLabel[role]}.`,
      variant: "info"
    });
  };

  const resetPassword = (user: User) => {
    toast({
      title: "Password Reset",
      description: `Password reset link sent to ${user.email}.`,
      variant: "success"
    });
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: "Copied", description: `${email} copied to clipboard.`, variant: "success" });
    } catch {
      toast({ title: "Copy Failed", description: "Could not copy email.", variant: "error" });
    }
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setUsers((current) => current.filter((item) => item.id !== deleteCandidate.id));
    toast({ title: "User Deleted", description: `${deleteCandidate.email} removed.`, variant: "success" });

    if (selectedUserId === deleteCandidate.id) {
      setSelectedUserId(null);
      setDetailOpen(false);
    }

    setDeleteCandidate(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>Manage access, roles, and warehouse assignments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Name *</p>
              <Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Enter name" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Email *</p>
              <Input type="email" value={formValues.email} onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))} placeholder="Enter email" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Role</p>
                <Select value={formValues.role} onValueChange={(value) => setFormValues((current) => ({ ...current, role: value as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="admin-eval">Admin Eval</SelectItem>
                    <SelectItem value="warehouse-operator">Warehouse Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as UserStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Warehouse Location</p>
              <Select value={formValues.warehouseLocation || "none"} onValueChange={(value) => setFormValues((current) => ({ ...current, warehouseLocation: value === "none" ? "" : value }))}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No warehouse</SelectItem>
                  {warehouseOptions.map((warehouse) => (<SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveUser}>{formMode === "edit" ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>{deleteCandidate ? `Delete ${deleteCandidate.email}? This action is mock and cannot be undone.` : "Delete selected user?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetPasswordCandidate)} onOpenChange={(open) => !open && setResetPasswordCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>{resetPasswordCandidate ? `Send password reset link to ${resetPasswordCandidate.email}?` : "Reset selected user password?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setResetPasswordCandidate(null)}>Cancel</Button>
            <Button onClick={() => { if (resetPasswordCandidate) resetPassword(resetPasswordCandidate); setResetPasswordCandidate(null); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedUserId(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-lg">
          {selectedUser ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">{selectedUser.name}</SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetDescription className="font-mono text-xs">{selectedUser.email}</SheetDescription>
                    <Badge className={userStatusBadgeClass[selectedUser.status]}>{statusLabel[selectedUser.status]}</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Access</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <Badge className={userRoleBadgeClass[selectedUser.role]}>{roleLabel[selectedUser.role]}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={userStatusBadgeClass[selectedUser.status]}>{statusLabel[selectedUser.status]}</Badge>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Assignment</h3>
                  <p className="mt-3 text-sm">{selectedUser.warehouseLocation || "-"}</p>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Last Login</p><p>{selectedUser.lastLoginAt || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Created</p><p>{selectedUser.createdAt}</p></div>
                    <div><p className="text-xs text-muted-foreground">Updated</p><p>{selectedUser.updatedAt}</p></div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(selectedUser)}>Edit</Button>
                <Button variant="outline" onClick={() => setUserStatus(selectedUser, selectedUser.status === "active" ? "inactive" : "active")}>{selectedUser.status === "active" ? "Deactivate" : "Activate"}</Button>
                <Button variant="outline" onClick={() => setResetPasswordCandidate(selectedUser)}>Reset Password</Button>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedUser)}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">User not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Users"
        subtitle="Manage access, roles, and warehouse assignments."
        actions={<Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}><Plus className="h-4 w-4" />Add New User</Button>}
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.total}</p><p className="mt-1 text-xs text-muted-foreground">All registered user accounts.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.active}</p><p className="mt-1 text-xs text-muted-foreground">Accounts with active access.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.inactive}</p><p className="mt-1 text-xs text-muted-foreground">Disabled user accounts.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Warehouse Operators</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.warehouseOperators}</p><p className="mt-1 text-xs text-muted-foreground">Users assigned to warehouse ops role.</p></CardContent></Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search name, email, warehouse..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9"><Filter className="h-4 w-4" />Filters{activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}</Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>User Filters</SheetTitle>
                      <SheetDescription>Filter users by status, role, warehouse location, and email domain.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <Select value={draftFilters.status} onValueChange={(value) => setDraftFilters((current) => ({ ...current, status: value as FilterState["status"] }))}>
                          <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Role</p>
                        <Select value={draftFilters.role} onValueChange={(value) => setDraftFilters((current) => ({ ...current, role: value as FilterState["role"] }))}>
                          <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="admin-eval">Admin Eval</SelectItem>
                            <SelectItem value="warehouse-operator">Warehouse Operator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Warehouse Location</p>
                        <Select value={draftFilters.warehouseLocation} onValueChange={(value) => setDraftFilters((current) => ({ ...current, warehouseLocation: value }))}>
                          <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {warehouseOptions.map((warehouse) => (<SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Email Domain</p>
                        <Input placeholder="mail.com" value={draftFilters.emailDomain} onChange={(event) => setDraftFilters((current) => ({ ...current, emailDomain: event.target.value }))} />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={clearFilters}>Reset</Button>
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={applyFilters}>Apply</Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9"><Columns3 className="h-4 w-4" />Columns</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={visibleColumns.name} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, name: Boolean(value) }))}>Name</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.email} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, email: Boolean(value) }))}>Email</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.role} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, role: Boolean(value) }))}>Role</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.warehouseLocation} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, warehouseLocation: Boolean(value) }))}>Warehouse Location</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.status} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, status: Boolean(value) }))}>Status</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9"><SlidersHorizontal className="h-4 w-4" />Density: {density === "compact" ? "Compact" : "Comfortable"}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Row Density</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDensity("compact")}>Compact</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDensity("comfortable")}>Comfortable</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="h-9"><Download className="h-4 w-4" />Export</Button>
              </>
            }
            meta={
              <>
                {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount} filters applied</Badge> : null}
                <span>{filteredUsers.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  {visibleColumns.name ? <TableHead className={cellClass}>Name</TableHead> : null}
                  {visibleColumns.email ? <TableHead className={cellClass}>Email</TableHead> : null}
                  {visibleColumns.role ? <TableHead className={cellClass}>Role</TableHead> : null}
                  {visibleColumns.warehouseLocation ? <TableHead className={cellClass}>Warehouse Location</TableHead> : null}
                  {visibleColumns.status ? <TableHead className={cellClass}>Status</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedUsers.length === 0 ? (
                  <TableRow className={rowClass}><TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">No users found with current search and filters.</TableCell></TableRow>
                ) : (
                  pagedUsers.map((user) => (
                    <TableRow key={user.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openDetail(user)}>
                      {visibleColumns.name ? (
                        <TableCell className={cellClass}>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{getInitials(user.name)}</span>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                      ) : null}
                      {visibleColumns.email ? <TableCell className={`${cellClass} font-mono text-xs`}>{user.email}</TableCell> : null}
                      {visibleColumns.role ? <TableCell className={cellClass}><Badge className={`${userRoleBadgeClass[user.role]} ${badgeClass}`}>{roleLabel[user.role]}</Badge></TableCell> : null}
                      {visibleColumns.warehouseLocation ? <TableCell className={cellClass}><span className="block max-w-[300px] truncate" title={user.warehouseLocation}>{user.warehouseLocation || "-"}</span></TableCell> : null}
                      {visibleColumns.status ? <TableCell className={cellClass}><Badge className={`${userStatusBadgeClass[user.status]} ${badgeClass}`}>{statusLabel[user.status]}</Badge></TableCell> : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(user)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(user)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserStatus(user, user.status === "active" ? "inactive" : "active")}>{user.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setResetPasswordCandidate(user)}>Reset password</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserRole(user, "admin")}>Change role to Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserRole(user, "admin-eval")}>Change role to Admin Eval</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserRole(user, "warehouse-operator")}>Change role to Warehouse Operator</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyEmail(user.email)}><Copy className="h-4 w-4" />Copy email</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteCandidate(user)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredUsers.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
