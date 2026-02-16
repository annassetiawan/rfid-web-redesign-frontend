
"use client";

import * as React from "react";
import { Columns3, Download, Filter, MoreHorizontal, Plus, SlidersHorizontal, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { categoryBadgeClass, statusBadgeClass } from "@/components/shared/badge-map";
import { useDensity } from "@/components/shared/use-density";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import type { MasterUnit, MasterUnitCategory } from "@/lib/types/master-unit";
import { masterUnits } from "@/lib/mock/master-units";

const categoryLabel: Record<MasterUnitCategory, string> = {
  main: "Main Product",
  accessory: "Accessory"
};

type CategoryFilter = "all" | MasterUnitCategory;

type ColumnVisibility = {
  image: boolean;
  updated: boolean;
  status: boolean;
};

type FormErrors = {
  name?: string;
  category?: string;
};

export default function MasterDataUnitPage() {
  const [units, setUnits] = React.useState<MasterUnit[]>(masterUnits);
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | MasterUnit["status"]>("all");
  const [updatedFrom, setUpdatedFrom] = React.useState("");
  const [updatedTo, setUpdatedTo] = React.useState("");
  const [search, setSearch] = React.useState("");
  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "master-units-columns",
    { image: true, updated: true, status: true }
  );
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);

  const [selectedUnit, setSelectedUnit] = React.useState<MasterUnit | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [draftCategory, setDraftCategory] = React.useState<CategoryFilter>(categoryFilter);
  const [draftStatus, setDraftStatus] = React.useState<"all" | MasterUnit["status"]>(statusFilter);
  const [draftFrom, setDraftFrom] = React.useState(updatedFrom);
  const [draftTo, setDraftTo] = React.useState(updatedTo);

  const [addOpen, setAddOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formCategory, setFormCategory] = React.useState<"" | MasterUnitCategory>("");
  const [formActive, setFormActive] = React.useState(true);
  const [formImage, setFormImage] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingUnitId, setEditingUnitId] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importPreview, setImportPreview] = React.useState<MasterUnit[]>([]);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftCategory(categoryFilter);
      setDraftStatus(statusFilter);
      setDraftFrom(updatedFrom);
      setDraftTo(updatedTo);
    }
  }, [filtersOpen, categoryFilter, statusFilter, updatedFrom, updatedTo]);

  const filtersApplied =
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (updatedFrom ? 1 : 0) +
    (updatedTo ? 1 : 0);

  const filteredUnits = React.useMemo(() => {
    let items = units;

    if (categoryFilter !== "all") {
      items = items.filter((unit) => unit.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      items = items.filter((unit) => unit.status === statusFilter);
    }

    if (updatedFrom) {
      const fromDate = new Date(updatedFrom);
      items = items.filter((unit) => new Date(unit.updatedAt) >= fromDate);
    }

    if (updatedTo) {
      const toDate = new Date(updatedTo);
      items = items.filter((unit) => new Date(unit.updatedAt) <= toDate);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      items = items.filter((unit) => unit.name.toLowerCase().includes(query));
    }

    return items;
  }, [units, categoryFilter, statusFilter, updatedFrom, updatedTo, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);
  const pagedUnits = filteredUnits.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize);

  React.useEffect(() => {
    setPageIndex(1);
  }, [search, filtersApplied, density, pageSize, categoryFilter]);

  const applyFilters = () => {
    setCategoryFilter(draftCategory);
    setStatusFilter(draftStatus);
    setUpdatedFrom(draftFrom);
    setUpdatedTo(draftTo);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setUpdatedFrom("");
    setUpdatedTo("");
    setFiltersOpen(false);
  };

  const emptyColSpan =
    3 + (visibleColumns.image ? 1 : 0) + (visibleColumns.status ? 1 : 0) + (visibleColumns.updated ? 1 : 0);

  const resetForm = () => {
    setFormName("");
    setFormCategory("");
    setFormActive(true);
    setFormImage(null);
    setFormErrors({});
    setFormMode("create");
    setEditingUnitId(null);
  };

  const sampleImportRows: MasterUnit[] = [
    {
      id: "MU-IMPORT-01",
      name: "PAN-PA-2200",
      category: "main",
      status: "active",
      updatedAt: "2026-02-11"
    },
    {
      id: "MU-IMPORT-02",
      name: "Power Adapter Kit",
      category: "accessory",
      status: "active",
      updatedAt: "2026-02-11"
    },
    {
      id: "MU-IMPORT-03",
      name: "Console Cable - XL",
      category: "accessory",
      status: "inactive",
      updatedAt: "2026-02-10"
    }
  ];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormImage(null);
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormImage(preview);
  };

  const handleCreateUnit = () => {
    const errors: FormErrors = {};

    if (!formName.trim()) {
      errors.name = "Unit name is required.";
    }

    if (!formCategory) {
      errors.category = "Category is required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (formMode === "edit" && editingUnitId) {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === editingUnitId
            ? {
                ...unit,
                name: formName.trim(),
                category: formCategory as MasterUnitCategory,
                status: formActive ? "active" : "inactive",
                imageUrl: formImage ?? unit.imageUrl,
                updatedAt: new Date().toISOString().slice(0, 10)
              }
            : unit
        )
      );
    } else {
      const newUnit: MasterUnit = {
        id: `MU-${Date.now()}`,
        name: formName.trim(),
        category: formCategory as MasterUnitCategory,
        status: formActive ? "active" : "inactive",
        imageUrl: formImage ?? undefined,
        updatedAt: new Date().toISOString().slice(0, 10)
      };

      setUnits((prev) => [newUnit, ...prev]);
    }

    setAddOpen(false);
    resetForm();
  };

  const openCreateDialog = () => {
    resetForm();
    setFormMode("create");
    setAddOpen(true);
  };

  const openEditDialog = (unit: MasterUnit) => {
    setFormMode("edit");
    setEditingUnitId(unit.id);
    setFormName(unit.name);
    setFormCategory(unit.category);
    setFormActive(unit.status === "active");
    setFormImage(unit.imageUrl ?? null);
    setFormErrors({});
    setAddOpen(true);
  };

  const toggleUnitStatus = (unit: MasterUnit) => {
    setUnits((prev) =>
      prev.map((item) =>
        item.id === unit.id
          ? {
              ...item,
              status: item.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString().slice(0, 10)
            }
          : item
      )
    );
    setSelectedUnit((current) =>
      current && current.id === unit.id
        ? {
            ...current,
            status: current.status === "active" ? "inactive" : "active",
            updatedAt: new Date().toISOString().slice(0, 10)
          }
        : current
    );
  };

  const handleMockParse = () => {
    setImportPreview(sampleImportRows);
  };

  const handleImport = () => {
    if (importPreview.length === 0) {
      return;
    }
    setUnits((prev) => [...importPreview, ...prev]);
    setImportPreview([]);
    setImportOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Master Data"
        title="Master Data Unit"
        subtitle="Manage unit metadata and classification across products."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add New Unit
            </Button>
          </>
        }
      />

      <Separator />

      <Tabs value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)} className="space-y-4">
        <TabsList className="w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="main">Main Product</TabsTrigger>
          <TabsTrigger value="accessory">Accessory</TabsTrigger>
        </TabsList>

        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Units Table</CardTitle>
              <p className="text-sm text-muted-foreground">Search, filter, and manage master unit data.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableToolbar
              searchPlaceholder="Search unit name..."
              searchValue={search}
              onSearchChange={setSearch}
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
                        <p className="text-sm text-muted-foreground">Filter units by category, status, or date.</p>
                      </SheetHeader>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Status</p>
                          <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as typeof draftStatus)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Category</p>
                          <Select value={draftCategory} onValueChange={(value) => setDraftCategory(value as CategoryFilter)}>
                            <SelectTrigger>
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="main">Main Product</SelectItem>
                              <SelectItem value="accessory">Accessory</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Updated Date</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              type="date"
                              value={draftFrom}
                              onChange={(event) => setDraftFrom(event.target.value)}
                            />
                            <Input
                              type="date"
                              value={draftTo}
                              onChange={(event) => setDraftTo(event.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                        <Button variant="outline" onClick={clearFilters}>Clear</Button>
                        <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={applyFilters}>
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
                        checked={visibleColumns.image}
                        onCheckedChange={(value) =>
                          setVisibleColumns((current) => ({ ...current, image: Boolean(value) }))
                        }
                      >
                        Image
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.status}
                        onCheckedChange={(value) =>
                          setVisibleColumns((current) => ({ ...current, status: Boolean(value) }))
                        }
                      >
                        Status
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={visibleColumns.updated}
                        onCheckedChange={(value) =>
                          setVisibleColumns((current) => ({ ...current, updated: Boolean(value) }))
                        }
                      >
                        Updated
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
                  {filtersApplied > 0 && <Badge variant="secondary">{filtersApplied} filters applied</Badge>}
                  <span>{filteredUnits.length} results</span>
                </>
              }
            />

            <div className="rounded-lg border border-border/60">
              <Sheet open={Boolean(selectedUnit)} onOpenChange={(open) => !open && setSelectedUnit(null)}>
                <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                  {selectedUnit && (
                    <>
                      <SheetHeader>
                        <div className="flex items-start gap-4">
                          {selectedUnit.imageUrl ? (
                            <img
                              src={selectedUnit.imageUrl}
                              alt={selectedUnit.name}
                              className="h-14 w-14 rounded-lg border border-border/60 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border/60 bg-muted text-sm font-semibold text-muted-foreground">
                              {selectedUnit.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <SheetTitle className="flex items-center gap-2">
                              {selectedUnit.name}
                              <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                                {categoryLabel[selectedUnit.category]}
                              </Badge>
                            </SheetTitle>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge className={categoryBadgeClass[selectedUnit.category]}>
                                {categoryLabel[selectedUnit.category]}
                              </Badge>
                              <Badge className={statusBadgeClass[selectedUnit.status]}>{selectedUnit.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </SheetHeader>

                      <div className="grid gap-5 text-sm text-slate-600 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Category</p>
                          <Badge className={categoryBadgeClass[selectedUnit.category]}>
                            {categoryLabel[selectedUnit.category]}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                          <Badge className={statusBadgeClass[selectedUnit.status]}>{selectedUnit.status}</Badge>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Updated</p>
                          <p className="font-medium text-slate-900">{selectedUnit.updatedAt}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Unit ID</p>
                          <p className="font-medium text-slate-900">{selectedUnit.id}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm font-semibold text-slate-800">Unit Details</p>
                        <div className="mt-2 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                          Unit details and metadata will appear here.
                        </div>
                      </div>

                      <div className="mt-auto flex items-center gap-2 border-t border-slate-200 pt-4">
                        <Button variant="outline" onClick={() => openEditDialog(selectedUnit)}>
                          Edit
                        </Button>
                        <Button
                          className="bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => toggleUnitStatus(selectedUnit)}
                        >
                          {selectedUnit.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>

              <Table>
                <TableHeader className="sticky top-0 bg-card/95">
                  <TableRow className={rowClass}>
                    <TableHead className={cellClass}>Name</TableHead>
                    <TableHead className={cellClass}>Category</TableHead>
                    {visibleColumns.image && <TableHead className={cellClass}>Image</TableHead>}
                    {visibleColumns.status && <TableHead className={cellClass}>Status</TableHead>}
                    {visibleColumns.updated && <TableHead className={cellClass}>Updated</TableHead>}
                    <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedUnits.length === 0 ? (
                    <TableRow className={rowClass}>
                      <TableCell colSpan={emptyColSpan} className="py-12 text-center text-sm text-muted-foreground">
                        No units match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedUnits.map((unit) => (
                      <TableRow
                        key={unit.id}
                        className={`${rowClass} cursor-pointer hover:bg-muted/40`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <TableCell className={`${cellClass} font-medium text-foreground`}>{unit.name}</TableCell>
                        <TableCell className={cellClass}>
                          <Badge className={`${categoryBadgeClass[unit.category]} ${badgeClass}`}>
                            {categoryLabel[unit.category]}
                          </Badge>
                        </TableCell>
                        {visibleColumns.image && (
                          <TableCell className={cellClass}>
                            {unit.imageUrl ? (
                              <img
                                src={unit.imageUrl}
                                alt={unit.name}
                                className="h-10 w-10 rounded-md border border-border/60 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-xs font-semibold text-muted-foreground">
                                {unit.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell className={cellClass}>
                            <Badge className={`${statusBadgeClass[unit.status]} ${badgeClass}`}>{unit.status}</Badge>
                          </TableCell>
                        )}
                        {visibleColumns.updated && <TableCell className={cellClass}>{unit.updatedAt}</TableCell>}
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
                              <DropdownMenuItem onClick={() => setSelectedUnit(unit)}>View details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(unit)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleUnitStatus(unit)}>
                                {unit.status === "active" ? "Set Inactive" : "Set Active"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-rose-600">Delete</DropdownMenuItem>
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
                totalCount={filteredUnits.length}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}
              />
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "edit" ? "Edit Unit" : "Add New Unit"}</DialogTitle>
            <DialogDescription>
              {formMode === "edit"
                ? "Update unit details and status."
                : "Create a new master unit for products or accessories."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Unit Name *</p>
              <Input
                placeholder="Enter unit name"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
              />
              {formErrors.name && <p className="text-xs text-rose-600">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Category *</p>
              <Select value={formCategory} onValueChange={(value) => setFormCategory(value as MasterUnitCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Product</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-xs text-rose-600">{formErrors.category}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-xs text-muted-foreground">Toggle to set inactive</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Inactive</span>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Image</p>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {formImage ? (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 p-2">
                  <img src={formImage} alt="Preview" className="h-16 w-16 rounded-md object-cover" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Preview</p>
                    <p className="text-xs text-muted-foreground">Image ready to upload</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
                  Upload a square image to represent this unit.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleCreateUnit}>
              {formMode === "edit" ? "Save Changes" : "Create Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            setImportPreview([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Units</DialogTitle>
            <DialogDescription>Upload a .csv file to import multiple units at once.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Drag & drop CSV here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse (.csv only)</p>
              <div className="mt-4">
                <Input type="file" accept=".csv" onChange={handleMockParse} />
              </div>
            </div>

            <div className="rounded-lg border border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">Preview</p>
                <Button variant="outline" size="sm" onClick={handleMockParse}>
                  Generate Mock Rows
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.length === 0 ? (
                    <TableRow className="h-10">
                      <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        No rows parsed yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    importPreview.map((row) => (
                      <TableRow key={row.id} className="h-10">
                        <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                        <TableCell>
                          <Badge className={categoryBadgeClass[row.category]}>{categoryLabel[row.category]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClass[row.status]}>{row.status}</Badge>
                        </TableCell>
                        <TableCell>{row.updatedAt}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleImport}
              disabled={importPreview.length === 0}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
