"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { cycleCountCategoryBadgeClass, cycleCountStatusBadgeClass } from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useToast } from "@/components/shared/toast-provider";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { cycleCountSessions } from "@/lib/mock/cycle-count";
import type { CycleCountCategory, CycleCountStatus } from "@/lib/types/cycle-count";

type ColumnVisibility = {
  createdDate: boolean;
  operator: boolean;
  warehouse: boolean;
};

type FilterState = {
  category: "all" | CycleCountCategory;
  warehouse: string;
  status: "all" | CycleCountStatus;
  createdFrom: string;
  createdTo: string;
  operator: string;
};

const defaultFilters: FilterState = {
  category: "all",
  warehouse: "all",
  status: "all",
  createdFrom: "",
  createdTo: "",
  operator: ""
};

const categoryLabel: Record<CycleCountCategory, string> = {
  product: "Product",
  accessory: "Accessory",
  all: "All"
};

const statusLabel: Record<CycleCountStatus, string> = {
  new: "New",
  inprogress: "In Progress",
  processed: "Processed",
  cancelled: "Cancelled"
};

export default function CycleCountPage() {
  const [sessions, setSessions] = React.useState(cycleCountSessions);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createWarehouse, setCreateWarehouse] = React.useState("all");
  const [createCategory, setCreateCategory] = React.useState<CycleCountCategory | "">("");
  const [createNotes, setCreateNotes] = React.useState("");
  const [createOperator, setCreateOperator] = React.useState("unassigned");
  const [createStartDate, setCreateStartDate] = React.useState("");
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const { toast } = useToast();
  const router = useRouter();
  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:cycle-count",
    { createdDate: true, operator: true, warehouse: true }
  );

  const warehouseOptions = React.useMemo(() => {
    return Array.from(new Set(sessions.map((session) => session.warehouseCode)));
  }, [sessions]);

  const operatorOptions = React.useMemo(() => {
    return Array.from(new Set(sessions.map((session) => session.operatorName)));
  }, [sessions]);

  const filteredSessions = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return sessions.filter((session) => {
      if (query) {
        const haystack = [session.id, session.operatorName, session.warehouseCode].join(" ").toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (filters.category !== "all" && session.category !== filters.category) {
        return false;
      }
      if (filters.warehouse !== "all" && session.warehouseCode !== filters.warehouse) {
        return false;
      }
      if (filters.status !== "all" && session.status !== filters.status) {
        return false;
      }
      if (filters.createdFrom && new Date(session.createdAt) < new Date(filters.createdFrom)) {
        return false;
      }
      if (filters.createdTo && new Date(session.createdAt) > new Date(filters.createdTo)) {
        return false;
      }
      if (filters.operator.trim()) {
        if (!session.operatorName.toLowerCase().includes(filters.operator.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [filters, searchQuery, sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedSessions = filteredSessions.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  const activeFilterCount = React.useMemo(() => {
    return (
      (filters.category !== "all" ? 1 : 0) +
      (filters.warehouse !== "all" ? 1 : 0) +
      (filters.status !== "all" ? 1 : 0) +
      (filters.createdFrom ? 1 : 0) +
      (filters.createdTo ? 1 : 0) +
      (filters.operator.trim() ? 1 : 0)
    );
  }, [filters]);

  const kpiSummary = React.useMemo(() => {
    const total = filteredSessions.length;
    const inProgress = filteredSessions.filter((session) => session.status === "inprogress").length;
    const completed = filteredSessions.filter((session) => session.status === "processed").length;
    return { total, inProgress, completed };
  }, [filteredSessions]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftFilters(filters);
    }
  }, [filters, filtersOpen]);

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setFiltersOpen(false);
  };

  const resetCreateForm = () => {
    setCreateWarehouse("all");
    setCreateCategory("");
    setCreateNotes("");
    setCreateOperator("unassigned");
    setCreateStartDate("");
    setCreateError(null);
  };

  const handleCreateSession = () => {
    if (!createCategory) {
      setCreateError("Category is required.");
      return;
    }
    if (createWarehouse === "all") {
      setCreateError("Warehouse is required.");
      return;
    }

    const maxIdNum = sessions.reduce((max, session) => {
      const raw = Number(session.id.split("-").pop() ?? "0");
      return Number.isFinite(raw) ? Math.max(max, raw) : max;
    }, 0);
    const nextId = `CC-2026-${String(maxIdNum + 1).padStart(3, "0")}`;
    const totalInventory = 120 + ((maxIdNum + 7) % 9) * 25;
    const createdAt = createStartDate || new Date().toISOString().slice(0, 10);

    setSessions((current) => [
      {
        id: nextId,
        category: createCategory,
        createdAt,
        operatorName: createOperator === "unassigned" ? "Unassigned" : createOperator,
        warehouseCode: createWarehouse,
        status: "new",
        totalInventory,
        scannedCount: 0,
        unscannedCount: totalInventory,
        untaggedCount: 0
      },
      ...current
    ]);
    setCreateOpen(false);
    resetCreateForm();
    toast({
      title: "Cycle Count Created",
      description: `Cycle count ${nextId} created successfully.`,
      variant: "success"
    });
  };

  const emptyColSpan =
    2 + (visibleColumns.createdDate ? 1 : 0) + (visibleColumns.operator ? 1 : 0) + (visibleColumns.warehouse ? 1 : 0) + 1;

  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Cycle Count</DialogTitle>
            <DialogDescription>Create a new cycle count session for warehouse operations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Warehouse</p>
              <Select value={createWarehouse} onValueChange={setCreateWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select warehouse</SelectItem>
                  {warehouseOptions.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Category</p>
              <Select value={createCategory} onValueChange={(value) => setCreateCategory(value as CycleCountCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Notes (optional)</p>
              <Textarea
                placeholder="Add notes for this request"
                value={createNotes}
                onChange={(event) => setCreateNotes(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Assign Operator (optional)</p>
              <Select value={createOperator} onValueChange={setCreateOperator}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {operatorOptions.map((operator) => (
                    <SelectItem key={operator} value={operator}>
                      {operator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Start Date (optional)</p>
              <Input type="date" value={createStartDate} onChange={(event) => setCreateStartDate(event.target.value)} />
            </div>
            {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleCreateSession}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Cycle Count"
        subtitle="Track inventory audit sessions and scan progress."
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Request Cycle Count
            </Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpiSummary.total}</p>
            <p className="mt-1 text-xs text-muted-foreground">All cycle count sessions in current result set.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpiSummary.inProgress}</p>
            <p className="mt-1 text-xs text-muted-foreground">Sessions with active scanning progress.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{kpiSummary.completed}</p>
            <p className="mt-1 text-xs text-muted-foreground">Sessions fully processed and closed.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <TableToolbar
            searchPlaceholder="Search cycle count ID, operator, warehouse..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>Filter cycle count sessions by category, operator, status, and date.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Category</p>
                        <Select
                          value={draftFilters.category}
                          onValueChange={(value) =>
                            setDraftFilters((current) => ({ ...current, category: value as FilterState["category"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Warehouse</p>
                        <Select
                          value={draftFilters.warehouse}
                          onValueChange={(value) => setDraftFilters((current) => ({ ...current, warehouse: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All warehouses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {warehouseOptions.map((warehouse) => (
                              <SelectItem key={warehouse} value={warehouse}>
                                {warehouse}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Status</p>
                        <Select
                          value={draftFilters.status}
                          onValueChange={(value) =>
                            setDraftFilters((current) => ({ ...current, status: value as FilterState["status"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="inprogress">In Progress</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Created Date</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="date"
                            value={draftFilters.createdFrom}
                            onChange={(event) =>
                              setDraftFilters((current) => ({ ...current, createdFrom: event.target.value }))
                            }
                          />
                          <Input
                            type="date"
                            value={draftFilters.createdTo}
                            onChange={(event) =>
                              setDraftFilters((current) => ({ ...current, createdTo: event.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Operator</p>
                        <Input
                          placeholder="Search operator"
                          value={draftFilters.operator}
                          onChange={(event) => setDraftFilters((current) => ({ ...current, operator: event.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear
                      </Button>
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleApplyFilters}>
                        Apply
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <Columns3 className="h-4 w-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.createdDate}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, createdDate: Boolean(value) }))}
                    >
                      Created Date
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.operator}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, operator: Boolean(value) }))}
                    >
                      Operator
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.warehouse}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, warehouse: Boolean(value) }))}
                    >
                      Warehouse
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <SlidersHorizontal className="h-4 w-4" />
                      Density: {density === "compact" ? "Compact" : "Comfortable"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Row Density</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDensity("compact")}>Compact</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDensity("comfortable")}>Comfortable</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="h-9">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </>
            }
            meta={
              <>
                {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} filters applied</Badge>}
                <span>{filteredSessions.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  <TableHead className={cellClass}>ID</TableHead>
                  <TableHead className={cellClass}>Category</TableHead>
                  {visibleColumns.createdDate && <TableHead className={cellClass}>Created Date</TableHead>}
                  {visibleColumns.operator && <TableHead className={cellClass}>Operator</TableHead>}
                  {visibleColumns.warehouse && <TableHead className={cellClass}>Warehouse</TableHead>}
                  <TableHead className={cellClass}>Status</TableHead>
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedSessions.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">
                      No cycle count sessions match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedSessions.map((session) => (
                    <TableRow
                      key={session.id}
                      className={`${rowClass} cursor-pointer hover:bg-muted/40`}
                      onClick={() => router.push(`/cycle-count/${session.id}`)}
                    >
                      <TableCell className={`${cellClass} font-medium text-foreground`}>{session.id}</TableCell>
                      <TableCell className={cellClass}>
                        <Badge className={`${cycleCountCategoryBadgeClass[session.category]} ${badgeClass}`}>
                          {categoryLabel[session.category]}
                        </Badge>
                      </TableCell>
                      {visibleColumns.createdDate && <TableCell className={cellClass}>{session.createdAt}</TableCell>}
                      {visibleColumns.operator && <TableCell className={cellClass}>{session.operatorName}</TableCell>}
                      {visibleColumns.warehouse && <TableCell className={cellClass}>{session.warehouseCode}</TableCell>}
                      <TableCell className={cellClass}>
                        <Badge className={`${cycleCountStatusBadgeClass[session.status]} ${badgeClass}`}>
                          {statusLabel[session.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={actionBtnClass}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/cycle-count/${session.id}`)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate session</DropdownMenuItem>
                            <DropdownMenuItem>Export row</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <PaginationFooter
              pageSize={pageSize}
              pageIndex={pageIndex}
              totalCount={filteredSessions.length}
              onPageChange={setPageIndex}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
