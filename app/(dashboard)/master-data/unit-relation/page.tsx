"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryBadgeClass, statusBadgeClass } from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { masterUnits } from "@/lib/mock/master-units";
import { unitRelations } from "@/lib/mock/unit-relations";
import type { MasterUnit, MasterUnitStatus } from "@/lib/types/master-unit";
import type { UnitRelation } from "@/lib/types/unit-relation";

type ColumnVisibility = {
  accessories: boolean;
  updated: boolean;
  status: boolean;
};

type FilterState = {
  mainUnitId: string;
  accessoryUnitId: string;
  status: "all" | MasterUnitStatus;
  updatedFrom: string;
  updatedTo: string;
};

type RelationRow = {
  relation: UnitRelation;
  mainUnit: MasterUnit | null;
  accessoryUnits: MasterUnit[];
};

const defaultFilters: FilterState = {
  mainUnitId: "all",
  accessoryUnitId: "all",
  status: "all",
  updatedFrom: "",
  updatedTo: ""
};

export default function UnitRelationPage() {
  const [relations, setRelations] = React.useState<UnitRelation[]>(unitRelations);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:unit-relations",
    { accessories: true, updated: true, status: true }
  );

  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [selectedRelationId, setSelectedRelationId] = React.useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingRelationId, setEditingRelationId] = React.useState<string | null>(null);
  const [formMainUnitId, setFormMainUnitId] = React.useState("all");
  const [formAccessoryIds, setFormAccessoryIds] = React.useState<string[]>([]);
  const [formAccessorySearch, setFormAccessorySearch] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const mainUnits = React.useMemo(() => masterUnits.filter((unit) => unit.category === "main"), []);
  const accessoryUnits = React.useMemo(() => masterUnits.filter((unit) => unit.category === "accessory"), []);

  const unitById = React.useMemo(() => {
    const map = new Map<string, MasterUnit>();
    masterUnits.forEach((unit) => map.set(unit.id, unit));
    return map;
  }, []);

  const relationRows = React.useMemo<RelationRow[]>(
    () =>
      relations.map((relation) => ({
        relation,
        mainUnit: unitById.get(relation.mainUnitId) ?? null,
        accessoryUnits: relation.accessoryUnitIds
          .map((accessoryId) => unitById.get(accessoryId))
          .filter((unit): unit is MasterUnit => Boolean(unit))
      })),
    [relations, unitById]
  );

  const selectedRelation = React.useMemo(
    () => relationRows.find((row) => row.relation.id === selectedRelationId) ?? null,
    [relationRows, selectedRelationId]
  );

  const filteredRows = React.useMemo(
    () =>
      relationRows.filter((row) => {
        if (!row.mainUnit) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesMain = row.mainUnit.name.toLowerCase().includes(query);
          const matchesAccessory = row.accessoryUnits.some((unit) => unit.name.toLowerCase().includes(query));
          if (!matchesMain && !matchesAccessory) {
            return false;
          }
        }
        if (filters.mainUnitId !== "all" && row.relation.mainUnitId !== filters.mainUnitId) {
          return false;
        }
        if (filters.accessoryUnitId !== "all" && !row.relation.accessoryUnitIds.includes(filters.accessoryUnitId)) {
          return false;
        }
        if (filters.status !== "all" && row.relation.status !== filters.status) {
          return false;
        }
        if (filters.updatedFrom && new Date(row.relation.updatedAt) < new Date(filters.updatedFrom)) {
          return false;
        }
        if (filters.updatedTo && new Date(row.relation.updatedAt) > new Date(filters.updatedTo)) {
          return false;
        }
        return true;
      }),
    [filters, relationRows, searchQuery]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedRows = filteredRows.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);
  const emptyColSpan =
    2 + (visibleColumns.accessories ? 1 : 0) + (visibleColumns.updated ? 1 : 0) + (visibleColumns.status ? 1 : 0);

  const activeFilterCount = React.useMemo(
    () =>
      (filters.mainUnitId !== "all" ? 1 : 0) +
      (filters.accessoryUnitId !== "all" ? 1 : 0) +
      (filters.status !== "all" ? 1 : 0) +
      (filters.updatedFrom ? 1 : 0) +
      (filters.updatedTo ? 1 : 0),
    [filters]
  );

  const accessoryOptions = React.useMemo(() => {
    const query = formAccessorySearch.toLowerCase().trim();
    if (!query) {
      return accessoryUnits;
    }
    return accessoryUnits.filter((unit) => unit.name.toLowerCase().includes(query));
  }, [accessoryUnits, formAccessorySearch]);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftFilters(filters);
    }
  }, [filters, filtersOpen]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [searchQuery, filters, density, pageSize]);

  const resetForm = () => {
    setFormMainUnitId("all");
    setFormAccessoryIds([]);
    setFormAccessorySearch("");
    setFormActive(true);
    setFormError(null);
    setEditingRelationId(null);
    setFormMode("create");
  };

  const openCreateDialog = () => {
    resetForm();
    setFormMode("create");
    setDialogOpen(true);
  };

  const openEditDialog = (row: RelationRow) => {
    setFormMode("edit");
    setEditingRelationId(row.relation.id);
    setFormMainUnitId(row.relation.mainUnitId);
    setFormAccessoryIds(row.relation.accessoryUnitIds);
    setFormAccessorySearch("");
    setFormActive(row.relation.status === "active");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setFiltersOpen(false);
  };

  const toggleAccessorySelection = (unitId: string, checked: boolean) => {
    setFormAccessoryIds((current) => {
      if (checked) {
        return current.includes(unitId) ? current : [...current, unitId];
      }
      return current.filter((id) => id !== unitId);
    });
  };

  const handleSaveRelation = () => {
    if (formMainUnitId === "all") {
      setFormError("Main product is required.");
      return;
    }
    if (formAccessoryIds.length === 0) {
      setFormError("Select at least one accessory.");
      return;
    }
    setFormError(null);

    const payload: Omit<UnitRelation, "id"> = {
      mainUnitId: formMainUnitId,
      accessoryUnitIds: formAccessoryIds,
      status: formActive ? "active" : "inactive",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: "demo.user"
    };

    if (formMode === "edit" && editingRelationId) {
      setRelations((current) =>
        current.map((relation) => (relation.id === editingRelationId ? { ...relation, ...payload } : relation))
      );
      setSelectedRelationId(editingRelationId);
    } else {
      const next: UnitRelation = { id: `UR-${Date.now()}`, ...payload };
      setRelations((current) => [next, ...current]);
      setSelectedRelationId(next.id);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleToggleStatus = (row: RelationRow) => {
    const nextStatus: MasterUnitStatus = row.relation.status === "active" ? "inactive" : "active";
    const updatedAt = new Date().toISOString().slice(0, 10);
    setRelations((current) =>
      current.map((relation) =>
        relation.id === row.relation.id ? { ...relation, status: nextStatus, updatedAt, updatedBy: "demo.user" } : relation
      )
    );
  };

  const handleDeleteRelation = (relationId: string) => {
    setRelations((current) => current.filter((relation) => relation.id !== relationId));
    if (selectedRelationId === relationId) {
      setSelectedRelationId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Unit Relation"
        subtitle="Manage mapping between main products and accessories."
        actions={
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add New Relation
          </Button>
        }
      />

      <Separator />

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Unit Relations</CardTitle>
          <p className="text-sm text-muted-foreground">Search, filter, and maintain main-to-accessory mappings.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Search main product or accessory..."
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
                      <SheetDescription>Filter by main product, accessory, status, and updated date.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Main Product</p>
                        <Select
                          value={draftFilters.mainUnitId}
                          onValueChange={(value) => setDraftFilters((current) => ({ ...current, mainUnitId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All main products" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {mainUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Accessory</p>
                        <Select
                          value={draftFilters.accessoryUnitId}
                          onValueChange={(value) => setDraftFilters((current) => ({ ...current, accessoryUnitId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All accessories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {accessoryUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Updated Date</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="date"
                            value={draftFilters.updatedFrom}
                            onChange={(event) =>
                              setDraftFilters((current) => ({ ...current, updatedFrom: event.target.value }))
                            }
                          />
                          <Input
                            type="date"
                            value={draftFilters.updatedTo}
                            onChange={(event) =>
                              setDraftFilters((current) => ({ ...current, updatedTo: event.target.value }))
                            }
                          />
                        </div>
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
                      checked={visibleColumns.accessories}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, accessories: Boolean(value) }))}
                    >
                      Accessories
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.updated}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, updated: Boolean(value) }))}
                    >
                      Updated
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.status}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, status: Boolean(value) }))}
                    >
                      Status
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
                <span>{filteredRows.length} results</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Sheet open={Boolean(selectedRelation)} onOpenChange={(open) => !open && setSelectedRelationId(null)}>
              <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                {selectedRelation ? (
                  <>
                    <SheetHeader>
                      <SheetTitle className="flex flex-wrap items-center gap-2">
                        {selectedRelation.mainUnit?.name ?? "Unknown Main Product"}
                        <Badge className={`${categoryBadgeClass.main} ${badgeClass}`}>Main Product</Badge>
                      </SheetTitle>
                      <SheetDescription>Relation details and accessory mapping metadata.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900">Accessories</p>
                      <div className="flex flex-wrap gap-2 rounded-lg border border-border/60 p-3">
                        {selectedRelation.accessoryUnits.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No accessories linked.</p>
                        ) : (
                          selectedRelation.accessoryUnits.map((unit) => (
                            <Badge key={unit.id} className={`${categoryBadgeClass.accessory} ${badgeClass}`}>
                              {unit.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-900">Metadata</p>
                      <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Relation ID</p>
                          <p className="font-medium text-slate-900">{selectedRelation.relation.id}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                          <Badge className={`${statusBadgeClass[selectedRelation.relation.status]} ${badgeClass}`}>
                            {selectedRelation.relation.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Updated</p>
                          <p className="font-medium text-slate-900">{selectedRelation.relation.updatedAt}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Updated By</p>
                          <p className="font-medium text-slate-900">{selectedRelation.relation.updatedBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={() => openEditDialog(selectedRelation)}>
                        Edit
                      </Button>
                      <Button
                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={() => handleToggleStatus(selectedRelation)}
                      >
                        {selectedRelation.relation.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => handleDeleteRelation(selectedRelation.relation.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                ) : null}
              </SheetContent>
            </Sheet>

            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  <TableHead className={cellClass}>Main Product</TableHead>
                  {visibleColumns.accessories && <TableHead className={cellClass}>Accessories</TableHead>}
                  {visibleColumns.updated && <TableHead className={cellClass}>Updated</TableHead>}
                  {visibleColumns.status && <TableHead className={cellClass}>Status</TableHead>}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">
                      No relations match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row) => {
                    const accessoryPreview = row.accessoryUnits.slice(0, 3);
                    const remainingCount = Math.max(0, row.accessoryUnits.length - accessoryPreview.length);
                    return (
                      <TableRow
                        key={row.relation.id}
                        className={`${rowClass} cursor-pointer hover:bg-muted/40`}
                        onClick={() => setSelectedRelationId(row.relation.id)}
                      >
                        <TableCell className={cellClass}>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-foreground">{row.mainUnit?.name ?? "Unknown Main Product"}</span>
                            <Badge className={`${categoryBadgeClass.main} w-fit ${badgeClass}`}>Main Product</Badge>
                          </div>
                        </TableCell>

                        {visibleColumns.accessories && (
                          <TableCell className={cellClass}>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {accessoryPreview.map((unit) => (
                                <Badge key={unit.id} className={`${categoryBadgeClass.accessory} ${badgeClass}`}>
                                  {unit.name}
                                </Badge>
                              ))}
                              {remainingCount > 0 && (
                                <Badge variant="secondary" className={badgeClass}>
                                  +{remainingCount} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        )}

                        {visibleColumns.updated && <TableCell className={cellClass}>{row.relation.updatedAt}</TableCell>}
                        {visibleColumns.status && (
                          <TableCell className={cellClass}>
                            <Badge className={`${statusBadgeClass[row.relation.status]} ${badgeClass}`}>
                              {row.relation.status}
                            </Badge>
                          </TableCell>
                        )}
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
                              <DropdownMenuItem onClick={() => setSelectedRelationId(row.relation.id)}>View details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(row)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                                {row.relation.status === "active" ? "Set Inactive" : "Set Active"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => handleDeleteRelation(row.relation.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <PaginationFooter
              pageSize={pageSize}
              pageIndex={pageIndex}
              totalCount={filteredRows.length}
              onPageChange={setPageIndex}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Edit Relation" : "Add New Relation"}</DialogTitle>
            <DialogDescription>
              {formMode === "edit"
                ? "Update mapping and status for this relation."
                : "Create a main product to accessory mapping."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Main Product</p>
              <Select value={formMainUnitId} onValueChange={setFormMainUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select main product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select main product</SelectItem>
                  {mainUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Accessories</p>
              <Input
                placeholder="Search accessories..."
                value={formAccessorySearch}
                onChange={(event) => setFormAccessorySearch(event.target.value)}
              />
              <div className="max-h-52 space-y-2 overflow-auto rounded-lg border border-border/60 p-3">
                {accessoryOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No accessories found.</p>
                ) : (
                  accessoryOptions.map((unit) => (
                    <label
                      key={unit.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60"
                    >
                      <span className="text-sm text-foreground">{unit.name}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border/60"
                        checked={formAccessoryIds.includes(unit.id)}
                        onChange={(event) => toggleAccessorySelection(unit.id, event.target.checked)}
                      />
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formAccessoryIds.length} accessories selected</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">Toggle to set inactive.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Inactive</span>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>

            {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSaveRelation}>
              {formMode === "edit" ? "Save Changes" : "Save Relation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
