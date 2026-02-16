
"use client";

import * as React from "react";
import { Columns3, Copy, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { logisticEmailTypeBadgeClass } from "@/components/shared/badge-map";
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
import { logisticEmails as mockLogisticEmails } from "@/lib/mock/logisticEmails";
import type { LogisticEmail, LogisticEmailType } from "@/lib/types/logisticEmail";

type ColumnVisibility = {
  name: boolean;
  email: boolean;
  warehouseLocation: boolean;
  type: boolean;
};

type FilterState = {
  type: "all" | LogisticEmailType;
  warehouseLocation: string;
  emailDomain: string;
  name: string;
};

type FormState = {
  name: string;
  email: string;
  warehouseLocation: string;
  type: LogisticEmailType;
};

const defaultFilters: FilterState = {
  type: "all",
  warehouseLocation: "all",
  emailDomain: "",
  name: ""
};

const defaultForm: FormState = {
  name: "",
  email: "",
  warehouseLocation: "",
  type: "warehouse"
};

const typeLabel: Record<LogisticEmailType, string> = {
  warehouse: "Warehouse",
  cc: "CC"
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LogisticEmailPage() {
  const { toast } = useToast();

  const [emails, setEmails] = React.useState<LogisticEmail[]>(mockLogisticEmails);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<FormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = React.useState<LogisticEmail | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:logistic-emails",
    { name: true, email: true, warehouseLocation: true, type: true }
  );

  const selectedEmail = React.useMemo(() => emails.find((item) => item.id === selectedId) ?? null, [emails, selectedId]);

  const warehouseOptions = React.useMemo(
    () => Array.from(new Set(emails.map((item) => item.warehouseLocation).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [emails]
  );

  const filteredEmails = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return emails.filter((item) => {
      if (query) {
        const haystack = [item.name, item.email, item.warehouseLocation, item.type].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (filters.warehouseLocation !== "all" && item.warehouseLocation !== filters.warehouseLocation) return false;
      if (filters.emailDomain.trim() && !item.email.toLowerCase().includes(`@${filters.emailDomain.toLowerCase().trim()}`)) return false;
      if (filters.name.trim() && !item.name.toLowerCase().includes(filters.name.toLowerCase().trim())) return false;

      return true;
    });
  }, [emails, filters, searchQuery]);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.type !== "all" ? 1 : 0) +
      (filters.warehouseLocation !== "all" ? 1 : 0) +
      (filters.emailDomain.trim() ? 1 : 0) +
      (filters.name.trim() ? 1 : 0),
    [filters]
  );

  const kpi = React.useMemo(() => {
    const total = emails.length;
    const warehouseType = emails.filter((item) => item.type === "warehouse").length;
    const ccType = emails.filter((item) => item.type === "cc").length;
    return { total, warehouseType, ccType };
  }, [emails]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftFilters(filters);
    }
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedEmails = filteredEmails.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    (visibleColumns.name ? 1 : 0) +
    (visibleColumns.email ? 1 : 0) +
    (visibleColumns.warehouseLocation ? 1 : 0) +
    (visibleColumns.type ? 1 : 0) +
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

  const openEdit = (item: LogisticEmail) => {
    setFormMode("edit");
    setEditingId(item.id);
    setFormValues({
      name: item.name,
      email: item.email,
      warehouseLocation: item.warehouseLocation,
      type: item.type
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openDetail = (item: LogisticEmail) => {
    setSelectedId(item.id);
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

  const hasDuplicate = (value: FormState) => {
    const email = value.email.trim().toLowerCase();
    const warehouseLocation = value.warehouseLocation.trim().toLowerCase();
    const type = value.type;

    return emails.some(
      (item) =>
        item.id !== editingId &&
        item.email.toLowerCase() === email &&
        item.warehouseLocation.trim().toLowerCase() === warehouseLocation &&
        item.type === type
    );
  };

  const saveRecipient = () => {
    const name = formValues.name.trim();
    const email = formValues.email.trim().toLowerCase();
    const warehouseLocation = formValues.warehouseLocation.trim();

    if (!name || !email) {
      setFormError("Name and Email are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setFormError("Email format is invalid.");
      return;
    }

    if (formValues.type === "warehouse" && !warehouseLocation) {
      setFormError("Warehouse Location is required for Warehouse type.");
      return;
    }

    if (hasDuplicate({ ...formValues, name, email, warehouseLocation })) {
      setFormError("Duplicate combination Email + Warehouse + Type.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setEmails((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                email,
                warehouseLocation,
                type: formValues.type,
                updatedAt: now
              }
            : item
        )
      );
      toast({ title: "Recipient Updated", description: `${email} updated successfully.`, variant: "success" });
    } else {
      const maxId = emails.reduce((max, item) => {
        const parsed = Number(item.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const newItem: LogisticEmail = {
        id: `LE-${String(maxId + 1).padStart(3, "0")}`,
        name,
        email,
        warehouseLocation,
        type: formValues.type,
        createdAt: now,
        updatedAt: now
      };

      setEmails((current) => [newItem, ...current]);
      toast({ title: "Recipient Added", description: `${email} created successfully.`, variant: "success" });
    }

    setFormOpen(false);
    resetForm();
  };

  const copyEmail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copied", description: `${value} copied to clipboard.`, variant: "success" });
    } catch {
      toast({ title: "Copy Failed", description: "Could not copy email.", variant: "error" });
    }
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setEmails((current) => current.filter((item) => item.id !== deleteCandidate.id));
    toast({ title: "Recipient Deleted", description: `${deleteCandidate.email} removed.`, variant: "success" });

    if (selectedId === deleteCandidate.id) {
      setSelectedId(null);
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
            <DialogTitle>{formMode === "edit" ? "Edit Logistic Email" : "Add New Email"}</DialogTitle>
            <DialogDescription>Manage recipient lists for logistics notifications.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Name *</p>
              <Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Enter recipient name" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Email *</p>
              <Input type="email" value={formValues.email} onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))} placeholder="Enter recipient email" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <Select value={formValues.type} onValueChange={(value) => setFormValues((current) => ({ ...current, type: value as LogisticEmailType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="cc">CC</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveRecipient}>{formMode === "edit" ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Recipient</DialogTitle>
            <DialogDescription>{deleteCandidate ? `Delete ${deleteCandidate.email}? This action is mock and cannot be undone.` : "Delete selected recipient?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setSelectedId(null); }}>
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-lg">
          {selectedEmail ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">{selectedEmail.name}</SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetDescription className="font-mono text-xs">{selectedEmail.email}</SheetDescription>
                    <Badge className={logisticEmailTypeBadgeClass[selectedEmail.type]}>{typeLabel[selectedEmail.type]}</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Recipient</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Name</p><p>{selectedEmail.name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><p className="font-mono text-xs break-all">{selectedEmail.email}</p></div>
                    <div><p className="text-xs text-muted-foreground">Type</p><Badge className={logisticEmailTypeBadgeClass[selectedEmail.type]}>{typeLabel[selectedEmail.type]}</Badge></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Assignment</h3>
                  <div className="mt-3 text-sm">
                    <p className="text-xs text-muted-foreground">Warehouse Location</p>
                    <p>{selectedEmail.warehouseLocation || "-"}</p>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Created At</p><p>{selectedEmail.createdAt}</p></div>
                    <div><p className="text-xs text-muted-foreground">Updated At</p><p>{selectedEmail.updatedAt}</p></div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(selectedEmail)}>Edit</Button>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedEmail)}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Recipient not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Logistic Emails"
        subtitle="Manage recipient lists for logistics notifications by warehouse and type."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}><Plus className="h-4 w-4" />Add New Email</Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Recipients</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.total}</p><p className="mt-1 text-xs text-muted-foreground">All notification recipients.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Warehouse Type</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.warehouseType}</p><p className="mt-1 text-xs text-muted-foreground">Mapped to warehouse notifications.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">CC Type</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.ccType}</p><p className="mt-1 text-xs text-muted-foreground">Recipients in CC distribution.</p></CardContent></Card>
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
                      <SheetTitle>Logistic Email Filters</SheetTitle>
                      <SheetDescription>Refine recipients by type, warehouse, domain and name.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Type</p>
                        <Select value={draftFilters.type} onValueChange={(value) => setDraftFilters((current) => ({ ...current, type: value as FilterState["type"] }))}>
                          <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="cc">CC</SelectItem>
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

                      <div className="space-y-2"><p className="text-sm font-medium">Email Domain</p><Input placeholder="paloaltonetworks.com" value={draftFilters.emailDomain} onChange={(event) => setDraftFilters((current) => ({ ...current, emailDomain: event.target.value }))} /></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Name</p><Input placeholder="Filter name" value={draftFilters.name} onChange={(event) => setDraftFilters((current) => ({ ...current, name: event.target.value }))} /></div>
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
                    <DropdownMenuCheckboxItem checked={visibleColumns.warehouseLocation} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, warehouseLocation: Boolean(value) }))}>Warehouse Location</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.type} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, type: Boolean(value) }))}>Type</DropdownMenuCheckboxItem>
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
                <span>{filteredEmails.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  {visibleColumns.name ? <TableHead className={cellClass}>Name</TableHead> : null}
                  {visibleColumns.email ? <TableHead className={cellClass}>Email</TableHead> : null}
                  {visibleColumns.warehouseLocation ? <TableHead className={cellClass}>Warehouse Location</TableHead> : null}
                  {visibleColumns.type ? <TableHead className={cellClass}>Type</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedEmails.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">No recipients found with current search and filters.</TableCell>
                  </TableRow>
                ) : (
                  pagedEmails.map((item) => (
                    <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openDetail(item)}>
                      {visibleColumns.name ? <TableCell className={`${cellClass} font-medium`}>{item.name}</TableCell> : null}
                      {visibleColumns.email ? <TableCell className={`${cellClass} font-mono text-xs`}>{item.email}</TableCell> : null}
                      {visibleColumns.warehouseLocation ? <TableCell className={cellClass}><span className="block max-w-[320px] truncate" title={item.warehouseLocation}>{item.warehouseLocation || "-"}</span></TableCell> : null}
                      {visibleColumns.type ? <TableCell className={cellClass}><Badge className={`${logisticEmailTypeBadgeClass[item.type]} ${badgeClass}`}>{typeLabel[item.type]}</Badge></TableCell> : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(item)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyEmail(item.email)}><Copy className="h-4 w-4" />Copy Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteCandidate(item)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredEmails.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

