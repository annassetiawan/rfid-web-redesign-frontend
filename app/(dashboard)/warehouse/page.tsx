
"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { statusBadgeClass } from "@/components/shared/badge-map";
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
import { warehouses as mockWarehouses } from "@/lib/mock/warehouses";
import type { Warehouse, WarehouseStatus } from "@/lib/types/warehouse";

type ColumnVisibility = {
  code: boolean;
  address: boolean;
  country: boolean;
  state: boolean;
  city: boolean;
  zipCode: boolean;
  status: boolean;
};

type FilterState = {
  code: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  status: "all" | WarehouseStatus;
  createdFrom: string;
  createdTo: string;
};

type WarehouseFormState = {
  name: string;
  code: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  status: WarehouseStatus;
};

const defaultFilters: FilterState = {
  code: "",
  country: "all",
  state: "",
  city: "",
  zipCode: "",
  status: "all",
  createdFrom: "",
  createdTo: ""
};

const defaultForm: WarehouseFormState = {
  name: "",
  code: "",
  address: "",
  country: "",
  state: "",
  city: "",
  zipCode: "",
  status: "active"
};

export default function WarehousePage() {
  const { toast } = useToast();
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>(mockWarehouses);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<WarehouseFormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = React.useState<Warehouse | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:warehouses",
    { code: true, address: true, country: true, state: true, city: true, zipCode: true, status: true }
  );

  const selectedWarehouse = React.useMemo(
    () => warehouses.find((warehouse) => warehouse.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId]
  );

  const countryOptions = React.useMemo(
    () => Array.from(new Set(warehouses.map((warehouse) => warehouse.country))).sort((a, b) => a.localeCompare(b)),
    [warehouses]
  );

  const filteredWarehouses = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return warehouses.filter((warehouse) => {
      if (query) {
        const haystack = [warehouse.name, warehouse.code, warehouse.city, warehouse.country, warehouse.address]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.code.trim() && !warehouse.code.toLowerCase().includes(filters.code.toLowerCase().trim())) return false;
      if (filters.country !== "all" && warehouse.country !== filters.country) return false;
      if (filters.state.trim() && !warehouse.state.toLowerCase().includes(filters.state.toLowerCase().trim())) return false;
      if (filters.city.trim() && !warehouse.city.toLowerCase().includes(filters.city.toLowerCase().trim())) return false;
      if (filters.zipCode.trim() && !warehouse.zipCode.toLowerCase().includes(filters.zipCode.toLowerCase().trim())) return false;
      if (filters.status !== "all" && warehouse.status !== filters.status) return false;
      if (filters.createdFrom && new Date(warehouse.createdAt) < new Date(filters.createdFrom)) return false;
      if (filters.createdTo && new Date(warehouse.createdAt) > new Date(filters.createdTo)) return false;
      return true;
    });
  }, [filters, searchQuery, warehouses]);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.code.trim() ? 1 : 0) +
      (filters.country !== "all" ? 1 : 0) +
      (filters.state.trim() ? 1 : 0) +
      (filters.city.trim() ? 1 : 0) +
      (filters.zipCode.trim() ? 1 : 0) +
      (filters.status !== "all" ? 1 : 0) +
      (filters.createdFrom ? 1 : 0) +
      (filters.createdTo ? 1 : 0),
    [filters]
  );

  const kpi = React.useMemo(() => {
    const total = warehouses.length;
    const active = warehouses.filter((item) => item.status === "active").length;
    const inactive = warehouses.filter((item) => item.status === "inactive").length;
    return { total, active, inactive };
  }, [warehouses]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) setDraftFilters(filters);
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredWarehouses.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedWarehouses = filteredWarehouses.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    2 +
    (visibleColumns.code ? 1 : 0) +
    (visibleColumns.address ? 1 : 0) +
    (visibleColumns.country ? 1 : 0) +
    (visibleColumns.state ? 1 : 0) +
    (visibleColumns.city ? 1 : 0) +
    (visibleColumns.zipCode ? 1 : 0) +
    (visibleColumns.status ? 1 : 0);

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

  const openEdit = (warehouse: Warehouse) => {
    setFormMode("edit");
    setEditingId(warehouse.id);
    setFormValues({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      country: warehouse.country,
      state: warehouse.state,
      city: warehouse.city,
      zipCode: warehouse.zipCode,
      status: warehouse.status
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openDetail = (warehouse: Warehouse) => {
    setSelectedWarehouseId(warehouse.id);
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

  const saveWarehouse = () => {
    const name = formValues.name.trim();
    const code = formValues.code.trim().toUpperCase();

    if (!name || !code) {
      setFormError("Warehouse Name and Code are required.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setWarehouses((current) =>
        current.map((warehouse) =>
          warehouse.id === editingId
            ? { ...warehouse, ...formValues, name, code, updatedAt: now }
            : warehouse
        )
      );
      toast({ title: "Warehouse Updated", description: `${name} updated successfully.`, variant: "success" });
    } else {
      const maxId = warehouses.reduce((max, warehouse) => {
        const parsed = Number(warehouse.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const newWarehouse: Warehouse = {
        id: `WH-${String(maxId + 1).padStart(3, "0")}`,
        name,
        code,
        address: formValues.address.trim(),
        country: formValues.country.trim(),
        state: formValues.state.trim(),
        city: formValues.city.trim(),
        zipCode: formValues.zipCode.trim(),
        status: formValues.status,
        createdAt: now,
        updatedAt: now
      };

      setWarehouses((current) => [newWarehouse, ...current]);
      toast({ title: "Warehouse Created", description: `${newWarehouse.name} added successfully.`, variant: "success" });
    }

    setFormOpen(false);
    resetForm();
  };

  const toggleStatus = (warehouse: Warehouse) => {
    const nextStatus: WarehouseStatus = warehouse.status === "active" ? "inactive" : "active";

    setWarehouses((current) =>
      current.map((item) =>
        item.id === warehouse.id
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );

    toast({
      title: "Status Updated",
      description: `${warehouse.name} is now ${nextStatus}.`,
      variant: "info"
    });
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setWarehouses((current) => current.filter((item) => item.id !== deleteCandidate.id));

    toast({
      title: "Warehouse Deleted",
      description: `${deleteCandidate.name} removed from list.`,
      variant: "success"
    });

    if (selectedWarehouseId === deleteCandidate.id) {
      setSelectedWarehouseId(null);
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
            <DialogTitle>{formMode === "edit" ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
            <DialogDescription>Manage warehouse hubs and shipping origins used across requests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Warehouse Name *</p>
                <Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Enter warehouse name" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Code *</p>
                <Input value={formValues.code} onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Enter warehouse code" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Address</p>
              <Input value={formValues.address} onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))} placeholder="Enter address" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Country</p>
                <Select value={formValues.country || "none"} onValueChange={(value) => setFormValues((current) => ({ ...current, country: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select country</SelectItem>
                    {countryOptions.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">State</p>
                <Input value={formValues.state} onChange={(event) => setFormValues((current) => ({ ...current, state: event.target.value }))} placeholder="Enter state" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">City</p>
                <Input value={formValues.city} onChange={(event) => setFormValues((current) => ({ ...current, city: event.target.value }))} placeholder="Enter city" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Zip Code</p>
                <Input value={formValues.zipCode} onChange={(event) => setFormValues((current) => ({ ...current, zipCode: event.target.value }))} placeholder="Enter zip code" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as WarehouseStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveWarehouse}>{formMode === "edit" ? "Save Changes" : "Create Warehouse"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Warehouse</DialogTitle>
            <DialogDescription>{deleteCandidate ? `Delete ${deleteCandidate.name}? This action is mock and cannot be undone.` : "Delete selected warehouse?"}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setSelectedWarehouseId(null); }}>
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-lg">
          {selectedWarehouse ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">{selectedWarehouse.name}</SheetTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetDescription className="font-mono text-xs uppercase tracking-wide">{selectedWarehouse.code}</SheetDescription>
                    <Badge className={statusBadgeClass[selectedWarehouse.status]}>{selectedWarehouse.status === "active" ? "Active" : "Inactive"}</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Location</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Country</p><p>{selectedWarehouse.country || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">State</p><p>{selectedWarehouse.state || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">City</p><p>{selectedWarehouse.city || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Zip Code</p><p>{selectedWarehouse.zipCode || "-"}</p></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Address</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{selectedWarehouse.address || "-"}</p>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Created At</p><p>{selectedWarehouse.createdAt}</p></div>
                    <div><p className="text-xs text-muted-foreground">Updated At</p><p>{selectedWarehouse.updatedAt}</p></div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(selectedWarehouse)}>Edit</Button>
                <Button variant="outline" onClick={() => toggleStatus(selectedWarehouse)}>{selectedWarehouse.status === "active" ? "Deactivate" : "Activate"}</Button>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedWarehouse)}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Warehouse not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Warehouses"
        subtitle="Manage warehouse hubs and shipping origins used across requests."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}><Plus className="h-4 w-4" />Add New Warehouse</Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Warehouses</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.total}</p><p className="mt-1 text-xs text-muted-foreground">All warehouse hubs in master data.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.active}</p><p className="mt-1 text-xs text-muted-foreground">Warehouses available for operations.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.inactive}</p><p className="mt-1 text-xs text-muted-foreground">Warehouses currently not in use.</p></CardContent></Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search warehouse name, code, city..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>Warehouse Filters</SheetTitle>
                      <SheetDescription>Refine warehouse list by location, code, status, and created date.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2"><p className="text-sm font-medium">Code</p><Input placeholder="Filter code" value={draftFilters.code} onChange={(event) => setDraftFilters((current) => ({ ...current, code: event.target.value }))} /></div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Country</p>
                        <Select value={draftFilters.country} onValueChange={(value) => setDraftFilters((current) => ({ ...current, country: value }))}>
                          <SelectTrigger><SelectValue placeholder="All countries" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {countryOptions.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><p className="text-sm font-medium">State</p><Input placeholder="Filter state" value={draftFilters.state} onChange={(event) => setDraftFilters((current) => ({ ...current, state: event.target.value }))} /></div>
                      <div className="space-y-2"><p className="text-sm font-medium">City</p><Input placeholder="Filter city" value={draftFilters.city} onChange={(event) => setDraftFilters((current) => ({ ...current, city: event.target.value }))} /></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Zip Code</p><Input placeholder="Filter zip code" value={draftFilters.zipCode} onChange={(event) => setDraftFilters((current) => ({ ...current, zipCode: event.target.value }))} /></div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <Select value={draftFilters.status} onValueChange={(value) => setDraftFilters((current) => ({ ...current, status: value as FilterState["status"] }))}>
                          <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Created Date</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={draftFilters.createdFrom} onChange={(event) => setDraftFilters((current) => ({ ...current, createdFrom: event.target.value }))} />
                          <Input type="date" value={draftFilters.createdTo} onChange={(event) => setDraftFilters((current) => ({ ...current, createdTo: event.target.value }))} />
                        </div>
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
                    <DropdownMenuCheckboxItem checked={visibleColumns.code} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, code: Boolean(value) }))}>Code</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.address} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, address: Boolean(value) }))}>Address</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.country} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, country: Boolean(value) }))}>Country</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.state} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, state: Boolean(value) }))}>State</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.city} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, city: Boolean(value) }))}>City</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.zipCode} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, zipCode: Boolean(value) }))}>Zip Code</DropdownMenuCheckboxItem>
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
                <span>{filteredWarehouses.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  <TableHead className={cellClass}>Warehouse</TableHead>
                  {visibleColumns.code ? <TableHead className={cellClass}>Code</TableHead> : null}
                  {visibleColumns.address ? <TableHead className={cellClass}>Address</TableHead> : null}
                  {visibleColumns.country ? <TableHead className={cellClass}>Country</TableHead> : null}
                  {visibleColumns.state ? <TableHead className={cellClass}>State</TableHead> : null}
                  {visibleColumns.city ? <TableHead className={cellClass}>City</TableHead> : null}
                  {visibleColumns.zipCode ? <TableHead className={cellClass}>Zip Code</TableHead> : null}
                  {visibleColumns.status ? <TableHead className={cellClass}>Status</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedWarehouses.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">No warehouses found with current search and filters.</TableCell>
                  </TableRow>
                ) : (
                  pagedWarehouses.map((warehouse) => (
                    <TableRow key={warehouse.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openDetail(warehouse)}>
                      <TableCell className={`${cellClass} font-medium text-foreground`}>{warehouse.name}</TableCell>
                      {visibleColumns.code ? <TableCell className={cellClass}><Badge variant="outline" className={`font-mono ${badgeClass}`}>{warehouse.code}</Badge></TableCell> : null}
                      {visibleColumns.address ? <TableCell className={`${cellClass} text-muted-foreground`}><span className="block max-w-[300px] truncate" title={warehouse.address}>{warehouse.address || "-"}</span></TableCell> : null}
                      {visibleColumns.country ? <TableCell className={cellClass}>{warehouse.country || "-"}</TableCell> : null}
                      {visibleColumns.state ? <TableCell className={cellClass}>{warehouse.state || "-"}</TableCell> : null}
                      {visibleColumns.city ? <TableCell className={cellClass}>{warehouse.city || "-"}</TableCell> : null}
                      {visibleColumns.zipCode ? <TableCell className={cellClass}>{warehouse.zipCode || "-"}</TableCell> : null}
                      {visibleColumns.status ? <TableCell className={cellClass}><Badge className={`${statusBadgeClass[warehouse.status]} ${badgeClass}`}>{warehouse.status === "active" ? "Active" : "Inactive"}</Badge></TableCell> : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(warehouse)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(warehouse)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(warehouse)}>{warehouse.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteCandidate(warehouse)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredWarehouses.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
