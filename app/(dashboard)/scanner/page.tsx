
"use client";

import * as React from "react";
import { Columns3, Copy, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { scannerStateBadgeClass } from "@/components/shared/badge-map";
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
import { Textarea } from "@/components/ui/textarea";
import { scanners as mockScanners } from "@/lib/mock/scanners";
import type { Scanner, ScannerState } from "@/lib/types/scanner";

type ColumnVisibility = {
  serialNumber: boolean;
  modelName: boolean;
  brand: boolean;
  location: boolean;
  description: boolean;
  state: boolean;
};

type FilterState = {
  state: "all" | ScannerState;
  brand: string;
  location: string;
  modelName: string;
  serialNumber: string;
};

type ScannerFormState = {
  serialNumber: string;
  modelName: string;
  brand: string;
  location: string;
  state: ScannerState;
  description: string;
};

const defaultFilters: FilterState = {
  state: "all",
  brand: "all",
  location: "all",
  modelName: "",
  serialNumber: ""
};

const defaultForm: ScannerFormState = {
  serialNumber: "",
  modelName: "",
  brand: "",
  location: "",
  state: "new",
  description: ""
};

const scannerStateLabel: Record<ScannerState, string> = {
  new: "New",
  working: "Working",
  faulty: "Faulty",
  test: "Test"
};

export default function ScannerPage() {
  const { toast } = useToast();

  const [scanners, setScanners] = React.useState<Scanner[]>(mockScanners);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [selectedScannerId, setSelectedScannerId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formValues, setFormValues] = React.useState<ScannerFormState>(defaultForm);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = React.useState<Scanner | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:scanners",
    {
      serialNumber: true,
      modelName: true,
      brand: true,
      location: true,
      description: true,
      state: true
    }
  );

  const selectedScanner = React.useMemo(
    () => scanners.find((scanner) => scanner.id === selectedScannerId) ?? null,
    [scanners, selectedScannerId]
  );

  const brandOptions = React.useMemo(
    () => Array.from(new Set(scanners.map((scanner) => scanner.brand))).sort((a, b) => a.localeCompare(b)),
    [scanners]
  );

  const locationOptions = React.useMemo(
    () => Array.from(new Set(scanners.map((scanner) => scanner.location))).sort((a, b) => a.localeCompare(b)),
    [scanners]
  );

  const filteredScanners = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return scanners.filter((scanner) => {
      if (query) {
        const haystack = [scanner.serialNumber, scanner.modelName, scanner.brand, scanner.location, scanner.description]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (filters.state !== "all" && scanner.state !== filters.state) return false;
      if (filters.brand !== "all" && scanner.brand !== filters.brand) return false;
      if (filters.location !== "all" && scanner.location !== filters.location) return false;
      if (filters.modelName.trim() && !scanner.modelName.toLowerCase().includes(filters.modelName.toLowerCase().trim())) return false;
      if (filters.serialNumber.trim() && !scanner.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase().trim())) return false;

      return true;
    });
  }, [filters, scanners, searchQuery]);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.state !== "all" ? 1 : 0) +
      (filters.brand !== "all" ? 1 : 0) +
      (filters.location !== "all" ? 1 : 0) +
      (filters.modelName.trim() ? 1 : 0) +
      (filters.serialNumber.trim() ? 1 : 0),
    [filters]
  );

  const kpi = React.useMemo(() => {
    const total = scanners.length;
    const working = scanners.filter((item) => item.state === "working").length;
    const newly = scanners.filter((item) => item.state === "new").length;
    const faulty = scanners.filter((item) => item.state === "faulty").length;
    return { total, working, newly, faulty };
  }, [scanners]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftFilters(filters);
    }
  }, [filters, filtersOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredScanners.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedScanners = filteredScanners.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const emptyColSpan =
    (visibleColumns.serialNumber ? 1 : 0) +
    (visibleColumns.modelName ? 1 : 0) +
    (visibleColumns.brand ? 1 : 0) +
    (visibleColumns.location ? 1 : 0) +
    (visibleColumns.description ? 1 : 0) +
    (visibleColumns.state ? 1 : 0) +
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

  const openEdit = (scanner: Scanner) => {
    setFormMode("edit");
    setEditingId(scanner.id);
    setFormValues({
      serialNumber: scanner.serialNumber,
      modelName: scanner.modelName,
      brand: scanner.brand,
      location: scanner.location,
      state: scanner.state,
      description: scanner.description
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openDetail = (scanner: Scanner) => {
    setSelectedScannerId(scanner.id);
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

  const isSerialDuplicate = (serialNumber: string) => {
    const normalized = serialNumber.trim().toLowerCase();
    return scanners.some(
      (scanner) => scanner.serialNumber.toLowerCase() === normalized && scanner.id !== editingId
    );
  };

  const saveScanner = () => {
    const serialNumber = formValues.serialNumber.trim();
    const modelName = formValues.modelName.trim();
    const brand = formValues.brand.trim();

    if (!serialNumber || !modelName || !brand) {
      setFormError("Serial Number, Model Name, and Brand are required.");
      return;
    }

    if (isSerialDuplicate(serialNumber)) {
      setFormError("Serial Number must be unique.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (formMode === "edit" && editingId) {
      setScanners((current) =>
        current.map((scanner) =>
          scanner.id === editingId
            ? {
                ...scanner,
                serialNumber,
                modelName,
                brand,
                location: formValues.location.trim(),
                state: formValues.state,
                description: formValues.description.trim(),
                updatedAt: now
              }
            : scanner
        )
      );
      toast({
        title: "Scanner Updated",
        description: `${serialNumber} updated successfully.`,
        variant: "success"
      });
    } else {
      const maxId = scanners.reduce((max, scanner) => {
        const parsed = Number(scanner.id.split("-").pop() ?? "0");
        return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
      }, 0);

      const newScanner: Scanner = {
        id: `SC-${String(maxId + 1).padStart(3, "0")}`,
        serialNumber,
        modelName,
        brand,
        location: formValues.location.trim(),
        state: formValues.state,
        description: formValues.description.trim(),
        createdAt: now,
        updatedAt: now
      };

      setScanners((current) => [newScanner, ...current]);
      toast({
        title: "Scanner Added",
        description: `${newScanner.serialNumber} created successfully.`,
        variant: "success"
      });
    }

    setFormOpen(false);
    resetForm();
  };

  const setScannerState = (scanner: Scanner, nextState: ScannerState) => {
    setScanners((current) =>
      current.map((item) =>
        item.id === scanner.id
          ? {
              ...item,
              state: nextState,
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : item
      )
    );

    toast({
      title: "State Updated",
      description: `${scanner.serialNumber} marked as ${scannerStateLabel[nextState].toLowerCase()}.`,
      variant: "info"
    });
  };

  const copySerial = async (serialNumber: string) => {
    try {
      await navigator.clipboard.writeText(serialNumber);
      toast({ title: "Copied", description: `${serialNumber} copied to clipboard.`, variant: "success" });
    } catch {
      toast({ title: "Copy Failed", description: "Could not copy serial number.", variant: "error" });
    }
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;

    setScanners((current) => current.filter((item) => item.id !== deleteCandidate.id));
    toast({
      title: "Scanner Deleted",
      description: `${deleteCandidate.serialNumber} removed from list.`,
      variant: "success"
    });

    if (selectedScannerId === deleteCandidate.id) {
      setSelectedScannerId(null);
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
            <DialogTitle>{formMode === "edit" ? "Edit Scanner" : "Add Scanner"}</DialogTitle>
            <DialogDescription>Manage RFID scanner devices and their operational status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Serial Number *</p>
                <Input
                  value={formValues.serialNumber}
                  onChange={(event) => setFormValues((current) => ({ ...current, serialNumber: event.target.value }))}
                  placeholder="Enter serial number"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Model Name *</p>
                <Input
                  value={formValues.modelName}
                  onChange={(event) => setFormValues((current) => ({ ...current, modelName: event.target.value }))}
                  placeholder="Enter model name"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Brand *</p>
                <Select
                  value={formValues.brand || "none"}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, brand: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select brand</SelectItem>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Location</p>
                <Select
                  value={formValues.location || "none"}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, location: value === "none" ? "" : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select location</SelectItem>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">State</p>
              <Select value={formValues.state} onValueChange={(value) => setFormValues((current) => ({ ...current, state: value as ScannerState }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="faulty">Faulty</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <Textarea
                value={formValues.description}
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                placeholder="Enter notes or description"
              />
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={saveScanner}>{formMode === "edit" ? "Save Changes" : "Create Scanner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Scanner</DialogTitle>
            <DialogDescription>
              {deleteCandidate ? `Delete ${deleteCandidate.serialNumber}? This action is mock and cannot be undone.` : "Delete selected scanner?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteCandidate(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedScannerId(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-5 p-0 sm:max-w-lg">
          {selectedScanner ? (
            <>
              <div className="space-y-4 border-b border-border/60 px-6 py-5">
                <SheetHeader className="space-y-3 text-left">
                  <SheetTitle className="text-xl">Serial: {selectedScanner.serialNumber}</SheetTitle>
                  <div className="flex items-center gap-2">
                    <SheetDescription>{selectedScanner.modelName} • {selectedScanner.brand}</SheetDescription>
                    <Badge className={scannerStateBadgeClass[selectedScanner.state]}>{scannerStateLabel[selectedScanner.state]}</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Device</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Serial Number</p><p className="font-mono">{selectedScanner.serialNumber}</p></div>
                    <div><p className="text-xs text-muted-foreground">Model Name</p><p>{selectedScanner.modelName}</p></div>
                    <div><p className="text-xs text-muted-foreground">Brand</p><p>{selectedScanner.brand}</p></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Assignment</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Location</p><p>{selectedScanner.location || "-"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-wrap">{selectedScanner.description || "-"}</p></div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Created At</p><p>{selectedScanner.createdAt}</p></div>
                    <div><p className="text-xs text-muted-foreground">Updated At</p><p>{selectedScanner.updatedAt}</p></div>
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-auto flex items-center justify-end gap-2 border-t border-border/60 bg-background px-6 py-4">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => openEdit(selectedScanner)}>Edit</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Change State</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setScannerState(selectedScanner, "working")}>Mark as Working</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setScannerState(selectedScanner, "faulty")}>Mark as Faulty</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setScannerState(selectedScanner, "test")}>Mark as Test</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setScannerState(selectedScanner, "new")}>Mark as New</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="destructive" onClick={() => setDeleteCandidate(selectedScanner)}>Delete</Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Scanner not found.</div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title="Scanners"
        subtitle="Manage RFID scanner devices and their operational status."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreate}><Plus className="h-4 w-4" />Add Scanner</Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Devices</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.total}</p><p className="mt-1 text-xs text-muted-foreground">All registered scanners.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Working</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.working}</p><p className="mt-1 text-xs text-muted-foreground">Ready for operation.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">New</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.newly}</p><p className="mt-1 text-xs text-muted-foreground">Recently added devices.</p></CardContent></Card>
        <Card className="border-border/60 bg-card shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Faulty</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-foreground">{kpi.faulty}</p><p className="mt-1 text-xs text-muted-foreground">Needs maintenance.</p></CardContent></Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search serial, model, brand, location..."
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
                      <SheetTitle>Scanner Filters</SheetTitle>
                      <SheetDescription>Filter scanner devices by state, brand, location, and identity.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">State</p>
                        <Select value={draftFilters.state} onValueChange={(value) => setDraftFilters((current) => ({ ...current, state: value as FilterState["state"] }))}>
                          <SelectTrigger><SelectValue placeholder="All states" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="working">Working</SelectItem>
                            <SelectItem value="faulty">Faulty</SelectItem>
                            <SelectItem value="test">Test</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Brand</p>
                        <Select value={draftFilters.brand} onValueChange={(value) => setDraftFilters((current) => ({ ...current, brand: value }))}>
                          <SelectTrigger><SelectValue placeholder="All brands" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {brandOptions.map((brand) => (<SelectItem key={brand} value={brand}>{brand}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Location</p>
                        <Select value={draftFilters.location} onValueChange={(value) => setDraftFilters((current) => ({ ...current, location: value }))}>
                          <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {locationOptions.map((location) => (<SelectItem key={location} value={location}>{location}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2"><p className="text-sm font-medium">Model Name</p><Input placeholder="Filter model" value={draftFilters.modelName} onChange={(event) => setDraftFilters((current) => ({ ...current, modelName: event.target.value }))} /></div>
                      <div className="space-y-2"><p className="text-sm font-medium">Serial Number</p><Input placeholder="Filter serial" value={draftFilters.serialNumber} onChange={(event) => setDraftFilters((current) => ({ ...current, serialNumber: event.target.value }))} /></div>
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
                    <DropdownMenuCheckboxItem checked={visibleColumns.serialNumber} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, serialNumber: Boolean(value) }))}>Serial Number</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.modelName} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, modelName: Boolean(value) }))}>Model Name</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.brand} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, brand: Boolean(value) }))}>Brand</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.location} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, location: Boolean(value) }))}>Location</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.description} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, description: Boolean(value) }))}>Description</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.state} onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, state: Boolean(value) }))}>State</DropdownMenuCheckboxItem>
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
                <span>{filteredScanners.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  {visibleColumns.serialNumber ? <TableHead className={cellClass}>Serial Number</TableHead> : null}
                  {visibleColumns.modelName ? <TableHead className={cellClass}>Model Name</TableHead> : null}
                  {visibleColumns.brand ? <TableHead className={cellClass}>Brand</TableHead> : null}
                  {visibleColumns.location ? <TableHead className={cellClass}>Location</TableHead> : null}
                  {visibleColumns.description ? <TableHead className={cellClass}>Description</TableHead> : null}
                  {visibleColumns.state ? <TableHead className={cellClass}>State</TableHead> : null}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedScanners.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">No scanners found with current search and filters.</TableCell>
                  </TableRow>
                ) : (
                  pagedScanners.map((scanner) => (
                    <TableRow key={scanner.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => openDetail(scanner)}>
                      {visibleColumns.serialNumber ? <TableCell className={`${cellClass} font-mono`}>{scanner.serialNumber}</TableCell> : null}
                      {visibleColumns.modelName ? <TableCell className={cellClass}>{scanner.modelName}</TableCell> : null}
                      {visibleColumns.brand ? <TableCell className={cellClass}>{scanner.brand}</TableCell> : null}
                      {visibleColumns.location ? <TableCell className={cellClass}><Badge variant="secondary" className={badgeClass}>{scanner.location}</Badge></TableCell> : null}
                      {visibleColumns.description ? <TableCell className={`${cellClass} text-muted-foreground`}><span className="block max-w-[280px] truncate" title={scanner.description}>{scanner.description || "-"}</span></TableCell> : null}
                      {visibleColumns.state ? <TableCell className={cellClass}><Badge className={`${scannerStateBadgeClass[scanner.state]} ${badgeClass}`}>{scannerStateLabel[scanner.state]}</Badge></TableCell> : null}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(scanner)}>View details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(scanner)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setScannerState(scanner, "working")}>Mark as Working</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setScannerState(scanner, "faulty")}>Mark as Faulty</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setScannerState(scanner, "test")}>Mark as Test</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copySerial(scanner.serialNumber)}><Copy className="h-4 w-4" />Copy Serial</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => setDeleteCandidate(scanner)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter pageSize={pageSize} pageIndex={pageIndex} totalCount={filteredScanners.length} onPageChange={setPageIndex} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

