"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Columns3, Download, Filter, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cycleCountCategoryBadgeClass,
  cycleCountItemScanStatusBadgeClass,
  cycleCountStatusBadgeClass
} from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { cycleCountItems } from "@/lib/mock/cycle-count-items";
import { cycleCountSessions } from "@/lib/mock/cycle-count";
import type { CycleCountSession } from "@/lib/types/cycle-count";
import type {
  CycleCountItem,
  CycleCountItemCondition,
  CycleCountItemLocation,
  CycleCountItemScanStatus
} from "@/lib/types/cycle-count-item";

type ItemTab = "all" | CycleCountItemScanStatus;

type ColumnVisibility = {
  serialNumber: boolean;
  labelRfid: boolean;
  scanStatus: boolean;
  location: boolean;
  updatedAt: boolean;
  image: boolean;
};

type ItemFilters = {
  scanStatuses: CycleCountItemScanStatus[];
  location: "all" | CycleCountItemLocation;
  condition: "all" | CycleCountItemCondition;
};

const scanStatusLabel: Record<CycleCountItemScanStatus, string> = {
  scanned: "Scanned",
  unscanned: "Unscanned",
  untagged: "Untagged"
};

const cycleCountStatusLabel: Record<CycleCountSession["status"], string> = {
  new: "New",
  inprogress: "In Progress",
  processed: "Processed",
  cancelled: "Cancelled"
};

const categoryLabel: Record<CycleCountSession["category"], string> = {
  product: "Product",
  accessory: "Accessory",
  all: "All"
};

const locationLabel: Record<CycleCountItemLocation, string> = {
  warehouse: "Warehouse",
  staging: "Staging",
  customer_site: "Customer Site"
};

const defaultFilters: ItemFilters = {
  scanStatuses: ["scanned", "unscanned", "untagged"],
  location: "all",
  condition: "all"
};

export default function CycleCountDetailPage() {
  const params = useParams<{ id: string }>();
  const sessionId = decodeURIComponent(params.id ?? "");

  const session = React.useMemo<CycleCountSession | null>(
    () => cycleCountSessions.find((item) => item.id.toLowerCase() === sessionId.toLowerCase()) ?? null,
    [sessionId]
  );

  const [sessionStatus, setSessionStatus] = React.useState<CycleCountSession["status"]>(session?.status ?? "new");
  const [activeTab, setActiveTab] = React.useState<ItemTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<ItemFilters>(defaultFilters);
  const [draftFilters, setDraftFilters] = React.useState<ItemFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<CycleCountItem | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:cycle-count-items",
    { serialNumber: true, labelRfid: true, scanStatus: true, location: true, updatedAt: true, image: false }
  );

  const items = React.useMemo(
    () => cycleCountItems.filter((item) => item.cycleCountId.toLowerCase() === sessionId.toLowerCase()),
    [sessionId]
  );

  const counts = React.useMemo(() => {
    const scanned = items.filter((item) => item.scanStatus === "scanned").length;
    const unscanned = items.filter((item) => item.scanStatus === "unscanned").length;
    const untagged = items.filter((item) => item.scanStatus === "untagged").length;
    return { all: items.length, scanned, unscanned, untagged };
  }, [items]);

  const filteredItems = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      if (activeTab !== "all" && item.scanStatus !== activeTab) {
        return false;
      }
      if (!filters.scanStatuses.includes(item.scanStatus)) {
        return false;
      }
      if (filters.location !== "all" && item.location !== filters.location) {
        return false;
      }
      if (filters.condition !== "all" && item.condition !== filters.condition) {
        return false;
      }
      if (query) {
        const haystack = [item.name, item.serialNumber, item.labelRfid].join(" ").toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, filters, items, searchQuery]);

  const totalInventory = items.length;
  const scannedCount = counts.scanned;
  const remainingCount = Math.max(totalInventory - scannedCount, 0);
  const progress = totalInventory > 0 ? Math.round((scannedCount / totalInventory) * 100) : 0;

  const emptyColSpan =
    2 +
    (visibleColumns.serialNumber ? 1 : 0) +
    (visibleColumns.labelRfid ? 1 : 0) +
    (visibleColumns.scanStatus ? 1 : 0) +
    (visibleColumns.location ? 1 : 0) +
    (visibleColumns.updatedAt ? 1 : 0) +
    (visibleColumns.image ? 1 : 0);

  const activeFilterCount =
    (filters.scanStatuses.length < 3 ? 1 : 0) + (filters.location !== "all" ? 1 : 0) + (filters.condition !== "all" ? 1 : 0);

  React.useEffect(() => {
    if (filtersOpen) {
      setDraftFilters(filters);
    }
  }, [filters, filtersOpen]);

  const toggleScanStatus = (status: CycleCountItemScanStatus, checked: boolean) => {
    setDraftFilters((current) => {
      const next = checked
        ? Array.from(new Set([...current.scanStatuses, status]))
        : current.scanStatuses.filter((item) => item !== status);
      return { ...current, scanStatuses: next };
    });
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

  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Cycle Count Detail"
          subtitle="Session not found."
          actions={
            <Button asChild variant="ghost">
              <Link href="/cycle-count">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <Separator />
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Cycle count session for ID <span className="font-medium text-foreground">{sessionId || "-"}</span> was not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Sheet open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedItem.name}</SheetTitle>
                <SheetDescription>Item detail and quick actions.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm">
                <p className="font-medium text-slate-900">Serial: {selectedItem.serialNumber}</p>
                <p className="font-medium text-slate-900">RFID: {selectedItem.labelRfid}</p>
                <p className="font-medium text-slate-900">Location: {locationLabel[selectedItem.location]}</p>
                <Badge className={cycleCountItemScanStatusBadgeClass[selectedItem.scanStatus]}>
                  {scanStatusLabel[selectedItem.scanStatus]}
                </Badge>
              </div>
              <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-4">
                <Button variant="outline">Edit</Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Reassign</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader
        title={`Cycle Count: ${session.id}`}
        subtitle="Operational view of scanned, unscanned, and untagged items."
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href="/cycle-count">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Badge className={cycleCountCategoryBadgeClass[session.category]}>{categoryLabel[session.category]}</Badge>
            <Badge className="bg-slate-100 text-slate-700">{session.warehouseCode}</Badge>
            <Badge className={cycleCountStatusBadgeClass[sessionStatus]}>{cycleCountStatusLabel[sessionStatus]}</Badge>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => setSessionStatus("processed")}
              disabled={sessionStatus === "processed"}
            >
              Mark as Processed
            </Button>
          </>
        }
      />

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Inventory</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold text-foreground">{totalInventory}</p></CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Scanned</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold text-foreground">{scannedCount}</p></CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Remaining</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold text-foreground">{remainingCount}</p></CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-2 pt-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">Progress</p>
            <p className="text-sm text-muted-foreground">Scanned {scannedCount} of {totalInventory} ({progress}%)</p>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">Updated a few seconds ago.</p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ItemTab)}>
            <TabsList>
              <TabsTrigger value="all">All <Badge variant="secondary" className="ml-1 text-[10px]">{counts.all}</Badge></TabsTrigger>
              <TabsTrigger value="scanned">Scanned <Badge variant="secondary" className="ml-1 text-[10px]">{counts.scanned}</Badge></TabsTrigger>
              <TabsTrigger value="unscanned">Unscanned <Badge variant="secondary" className="ml-1 text-[10px]">{counts.unscanned}</Badge></TabsTrigger>
              <TabsTrigger value="untagged">Untagged <Badge variant="secondary" className="ml-1 text-[10px]">{counts.untagged}</Badge></TabsTrigger>
            </TabsList>
          </Tabs>

          <TableToolbar
            searchPlaceholder="Search name / serial / RFID..."
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
                      <SheetTitle>Item Filters</SheetTitle>
                      <SheetDescription>Refine list by scan status, location, and condition.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Scan Status</p>
                        <div className="space-y-2 rounded-lg border border-border/60 p-3">
                          {(["scanned", "unscanned", "untagged"] as CycleCountItemScanStatus[]).map((status) => (
                            <label key={status} className="flex items-center justify-between gap-2 text-sm">
                              <span>{scanStatusLabel[status]}</span>
                              <input
                                type="checkbox"
                                checked={draftFilters.scanStatuses.includes(status)}
                                onChange={(event) => toggleScanStatus(status, event.target.checked)}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Location</p>
                        <Select
                          value={draftFilters.location}
                          onValueChange={(value) =>
                            setDraftFilters((current) => ({ ...current, location: value as ItemFilters["location"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All locations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="customer_site">Customer Site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Condition</p>
                        <Select
                          value={draftFilters.condition}
                          onValueChange={(value) =>
                            setDraftFilters((current) => ({ ...current, condition: value as ItemFilters["condition"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All conditions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="needs_check">Needs Check</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                      <Button variant="outline" onClick={clearFilters}>Clear</Button>
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
                    <DropdownMenuCheckboxItem checked={visibleColumns.serialNumber} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, serialNumber: Boolean(v) }))}>Serial Number</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.labelRfid} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, labelRfid: Boolean(v) }))}>Label RFID</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.scanStatus} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, scanStatus: Boolean(v) }))}>Scan Status</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.location} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, location: Boolean(v) }))}>Location</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.updatedAt} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, updatedAt: Boolean(v) }))}>Updated At</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={visibleColumns.image} onCheckedChange={(v) => setVisibleColumns((c) => ({ ...c, image: Boolean(v) }))}>Image</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9"><SlidersHorizontal className="h-4 w-4" />Density: {density === "compact" ? "Compact" : "Comfortable"}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDensity("compact")}>Compact</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDensity("comfortable")}>Comfortable</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
            meta={
              <>
                {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} filters applied</Badge>}
                <span>{filteredItems.length} items</span>
              </>
            }
          />

          <div className="rounded-lg border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 bg-card/95">
                <TableRow className={rowClass}>
                  <TableHead className={cellClass}>Item Name</TableHead>
                  {visibleColumns.serialNumber && <TableHead className={cellClass}>Serial Number</TableHead>}
                  {visibleColumns.labelRfid && <TableHead className={cellClass}>Label RFID</TableHead>}
                  {visibleColumns.scanStatus && <TableHead className={cellClass}>Scan Status</TableHead>}
                  {visibleColumns.location && <TableHead className={cellClass}>Location</TableHead>}
                  {visibleColumns.updatedAt && <TableHead className={cellClass}>Updated At</TableHead>}
                  {visibleColumns.image && <TableHead className={cellClass}>Image</TableHead>}
                  <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow className={rowClass}>
                    <TableCell colSpan={emptyColSpan} className="py-10 text-center text-sm text-muted-foreground">No items found for this tab and filters.</TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => setSelectedItem(item)}>
                      <TableCell className={`${cellClass} font-medium text-foreground`}>{item.name}</TableCell>
                      {visibleColumns.serialNumber && <TableCell className={cellClass}>{item.serialNumber}</TableCell>}
                      {visibleColumns.labelRfid && <TableCell className={cellClass}>{item.labelRfid}</TableCell>}
                      {visibleColumns.scanStatus && (
                        <TableCell className={cellClass}>
                          <Badge className={`${cycleCountItemScanStatusBadgeClass[item.scanStatus]} ${badgeClass}`}>{scanStatusLabel[item.scanStatus]}</Badge>
                        </TableCell>
                      )}
                      {visibleColumns.location && <TableCell className={cellClass}>{locationLabel[item.location]}</TableCell>}
                      {visibleColumns.updatedAt && <TableCell className={cellClass}>{item.updatedAt}</TableCell>}
                      {visibleColumns.image && (
                        <TableCell className={cellClass}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md border border-border/60 object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted text-xs text-muted-foreground">NA</div>
                          )}
                        </TableCell>
                      )}
                      <TableCell className={`${cellClass} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedItem(item)}>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Add note</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
