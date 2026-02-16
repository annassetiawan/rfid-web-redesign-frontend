"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Filter, Plus, SlidersHorizontal, Columns3, MoreHorizontal, ArrowUpDown } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { requestStatusBadgeClass, requestTypeBadgeClass } from "@/components/shared/badge-map";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { localRequests } from "@/lib/mock/requests";
import type { LocalRequest, RequestStatus, RequestType } from "@/lib/types/request";


const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  inprogress: "In Progress",
  processed: "Processed"
};

const typeLabel: Record<RequestType, string> = {
  delivery: "Delivery",
  pickup: "Pickup"
};

const historyItems = [
  { time: "2026-01-28 19:21", label: "Packing list generated", actor: "apk" },
  { time: "2026-01-28 18:30", label: "Invoice uploaded", actor: "apk" },
  { time: "2026-01-28 17:05", label: "Request processed", actor: "kamal" }
];

type SortKey = "requestDate" | "lastUpdate" | "status";
type SortDirection = "asc" | "desc";

type FilterState = {
  warehouse: string;
  requestType: "all" | RequestType;
  status: "all" | RequestStatus;
  dateFrom: string;
  dateTo: string;
  lastUpdateFrom: string;
  lastUpdateTo: string;
  customerCompany: string;
  email: string;
};

type ColumnVisibility = {
  email: boolean;
  requestDate: boolean;
};

const defaultFilters: FilterState = {
  warehouse: "all",
  requestType: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  lastUpdateFrom: "",
  lastUpdateTo: "",
  customerCompany: "",
  email: ""
};

const warehouseOptions = ["Jakarta Hub", "Bandung DC", "Surabaya Hub", "Semarang Node", "Medan DC", "Makassar Hub"];

export default function LocalRequestsPage() {
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");
  const { columns: visibleColumns, setColumns: setVisibleColumns } = useColumnVisibility<ColumnVisibility>(
    "columns:requests",
    { email: false, requestDate: false }
  );
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<SortKey>("requestDate");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRequest, setSelectedRequest] = React.useState<LocalRequest | null>(null);
  const [currentTime, setCurrentTime] = React.useState<string | null>(null);

  const filteredRequests = React.useMemo(() => {
    return localRequests.filter((request) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          request.requestNumber.toLowerCase().includes(query) ||
          request.customerCompany.toLowerCase().includes(query) ||
          request.email.toLowerCase().includes(query);
        if (!matches) {
          return false;
        }
      }
      if (filters.warehouse !== "all" && request.warehouse !== filters.warehouse) {
        return false;
      }
      if (filters.requestType !== "all" && request.requestType !== filters.requestType) {
        return false;
      }
      if (filters.status !== "all" && request.status !== filters.status) {
        return false;
      }
      if (filters.customerCompany && !request.customerCompany.toLowerCase().includes(filters.customerCompany.toLowerCase())) {
        return false;
      }
      if (filters.email && !request.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const requestDate = new Date(request.requestDate);
        if (requestDate < from) {
          return false;
        }
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        const requestDate = new Date(request.requestDate);
        if (requestDate > to) {
          return false;
        }
      }
      if (filters.lastUpdateFrom) {
        const from = new Date(filters.lastUpdateFrom);
        const updatedAt = new Date(request.lastUpdate);
        if (updatedAt < from) {
          return false;
        }
      }
      if (filters.lastUpdateTo) {
        const to = new Date(filters.lastUpdateTo);
        const updatedAt = new Date(request.lastUpdate);
        if (updatedAt > to) {
          return false;
        }
      }
      return true;
    });
  }, [filters, searchQuery]);

  const sortedRequests = React.useMemo(() => {
    const statusOrder: Record<RequestStatus, number> = {
      new: 0,
      inprogress: 1,
      processed: 2
    };

    return [...filteredRequests].sort((a, b) => {
      if (sortKey === "status") {
        const comparison = statusOrder[a.status] - statusOrder[b.status];
        return sortDirection === "asc" ? comparison : -comparison;
      }

      const aDate = new Date(a[sortKey]).getTime();
      const bDate = new Date(b[sortKey]).getTime();
      const comparison = aDate - bDate;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredRequests, sortDirection, sortKey]);

  const totalRequests = sortedRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalRequests / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);

  const paginatedRequests = React.useMemo(() => {
    const start = (clampedPageIndex - 1) * pageSize;
    return sortedRequests.slice(start, start + pageSize);
  }, [clampedPageIndex, pageSize, sortedRequests]);

  const emptyColSpan = 7 + (visibleColumns.email ? 1 : 0) + (visibleColumns.requestDate ? 1 : 0);

  const activeFilterCount = React.useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === "warehouse" || key === "requestType" || key === "status") {
        return value !== "all" ? count + 1 : count;
      }
      return value ? count + 1 : count;
    }, 0);
  }, [filters]);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSort = (key: SortKey) => {
    setPageIndex(1);
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  };

  const handleOpenDetails = (request: LocalRequest) => {
    setSelectedRequest(request);
  };

  React.useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    setPageIndex(1);
  }, [pageSize, filters, sortKey, sortDirection, searchQuery, density]);

  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleString("en-US"));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Sheet open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
          <SheetHeader>
            <SheetTitle>Request Details</SheetTitle>
            <SheetDescription>Overview of the selected local request.</SheetDescription>
          </SheetHeader>

          {selectedRequest && (
            <div className="flex flex-col gap-6 px-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Request Detail</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedRequest.requestNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={requestTypeBadgeClass[selectedRequest.requestType]}>
                      {typeLabel[selectedRequest.requestType]}
                    </Badge>
                    <Badge className={requestStatusBadgeClass[selectedRequest.status]}>
                      {statusLabel[selectedRequest.status]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Ship From</p>
                    <p className="font-medium text-slate-900">{selectedRequest.warehouse}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Service Level</p>
                    <p className="font-medium text-slate-900">Standard</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Request Type</p>
                    <p className="font-medium text-slate-900">{typeLabel[selectedRequest.requestType]}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Note</p>
                    <p className="font-medium text-slate-900">Priority shipment - handle with care.</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Unit</p>
                <div className="mt-2 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                    <span>1. PAN-PA-M-100 (SN0001)</span>
                    <span className="text-xs text-slate-500">Accessories</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 px-4 py-3 text-xs text-slate-500">
                    <span>No</span>
                    <span>Accessories</span>
                    <span>RFID Label</span>
                    <span>Type</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 px-4 py-3 text-sm text-slate-700">
                    <span>1</span>
                    <span>Power Cord</span>
                    <span>RFID-100</span>
                    <span>
                      <Badge className="bg-indigo-50 text-indigo-600">Mandatory</Badge>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Customer</p>
                <div className="mt-2 grid gap-3 rounded-lg border border-slate-200 p-4 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Customer Company</p>
                    <p className="font-medium text-slate-900">{selectedRequest.customerCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Zip Code</p>
                    <p className="font-medium text-slate-900">08589</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Country</p>
                    <p className="font-medium text-slate-900">South Korea</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Contact Name</p>
                    <p className="font-medium text-slate-900">Chaeun Seong</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">City</p>
                    <p className="font-medium text-slate-900">Seoul</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Contact Email</p>
                    <p className="font-medium text-slate-900">{selectedRequest.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Address</p>
                    <p className="font-medium text-slate-900">
                      1101-ho 11F Smartgate, 70 Gasan digital 2-ro, Geumcheon-gu, Seoul
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Contact Phone</p>
                    <p className="font-medium text-slate-900">+82-1062815221</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">History</p>
                <div className="mt-2 space-y-4 rounded-lg border border-slate-200 p-4">
                  {historyItems.map((item, index) => (
                    <div key={item.time} className="flex gap-3 text-sm text-slate-600">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                        {index < historyItems.length - 1 && <span className="h-full w-px bg-slate-200" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">
                          {item.time} · By {item.actor}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="summary" className="space-y-3">
                <TabsList className="w-fit">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="units">Units</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                <TabsContent value="summary">
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                    Summary details will appear here.
                  </div>
                </TabsContent>
                <TabsContent value="units">
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                    Unit details will appear here.
                  </div>
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                    Timeline events will appear here.
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <PageHeader
        eyebrow="Requests"
        title="Local Request List"
        subtitle={currentTime ? `Local time: ${currentTime}` : "Local time: --"}
        actions={
          <>
            <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Link href="/requests/local/new">
                <Plus className="h-4 w-4" />
                Add New Request
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/requests/local/additional">
                <SlidersHorizontal className="h-4 w-4" />
                Create Additional Delivery
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </>
        }
      />

      <Separator />

      <Card className="border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base">Local Requests</CardTitle>
            <p className="text-sm text-muted-foreground">Track requests, approvals, and hand-offs at a glance.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Search request number, customer, email..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-9">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col gap-6 px-6 pb-6 pt-4">
                    <SheetHeader>
                      <SheetTitle>Advanced Filters</SheetTitle>
                      <SheetDescription>Refine local requests by status, owner, or timeframe.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Warehouse</p>
                        <Select value={filters.warehouse} onValueChange={(value) => setFilters((prev) => ({ ...prev, warehouse: value }))}>
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
                        <p className="text-sm font-medium">Request Status</p>
                        <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value as FilterState["status"] }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="inprogress">In Progress</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Request Type</p>
                        <Select value={filters.requestType} onValueChange={(value) => setFilters((prev) => ({ ...prev, requestType: value as FilterState["requestType"] }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="pickup">Pickup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Request Date</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                          />
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Last Update</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            type="date"
                            value={filters.lastUpdateFrom}
                            onChange={(event) => setFilters((prev) => ({ ...prev, lastUpdateFrom: event.target.value }))}
                          />
                          <Input
                            type="date"
                            value={filters.lastUpdateTo}
                            onChange={(event) => setFilters((prev) => ({ ...prev, lastUpdateTo: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Customer Company</p>
                        <Input
                          placeholder="Search customer company"
                          value={filters.customerCompany}
                          onChange={(event) => setFilters((prev) => ({ ...prev, customerCompany: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Email</p>
                        <Input
                          placeholder="Search email address"
                          value={filters.email}
                          onChange={(event) => setFilters((prev) => ({ ...prev, email: event.target.value }))}
                        />
                      </div>
                    </div>

                    <SheetFooter>
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear
                      </Button>
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Apply Filters</Button>
                    </SheetFooter>
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
                      checked={visibleColumns.email}
                      onCheckedChange={(value) => setVisibleColumns((current) => ({ ...current, email: Boolean(value) }))}
                    >
                      Email
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={visibleColumns.requestDate}
                      onCheckedChange={(value) =>
                        setVisibleColumns((current) => ({ ...current, requestDate: Boolean(value) }))
                      }
                    >
                      Request Date
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
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount} filters applied</Badge>
                )}
                <span>{totalRequests} results</span>
              </>
            }
          />

          <Table className="min-w-[1100px]">
            <TableHeader className="sticky top-0 z-10 bg-card/95">
              <TableRow className={rowClass}>
                <TableHead className={cellClass}>Request No.</TableHead>
                <TableHead className={cellClass}>Customer</TableHead>
                <TableHead className={cellClass}>Warehouse</TableHead>
                {visibleColumns.email && <TableHead className={cellClass}>Email</TableHead>}
                <TableHead className={cellClass}>Request Type</TableHead>
                {visibleColumns.requestDate && (
                  <TableHead className={cellClass}>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-slate-600 hover:text-slate-900"
                      onClick={() => handleSort("requestDate")}
                    >
                      Request Date
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                )}
                <TableHead className={cellClass}>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("lastUpdate")}
                  >
                    Last Update
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className={cellClass}>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className={rowClass}>
                    {Array.from({ length: emptyColSpan }).map((__, cellIndex) => (
                      <TableCell key={`skeleton-cell-${cellIndex}`} className={cellClass}>
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading &&
                paginatedRequests.map((request: LocalRequest) => (
                  <TableRow
                    key={request.id}
                    className={`${rowClass} cursor-pointer hover:bg-muted/40`}
                    onClick={() => handleOpenDetails(request)}
                  >
                    <TableCell className={`${cellClass} font-medium text-foreground`}>
                      <Button
                        variant="ghost"
                        className="h-auto px-0 text-indigo-600 hover:text-indigo-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenDetails(request);
                        }}
                      >
                        {request.requestNumber}
                      </Button>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div>
                        <p className="font-medium text-slate-900">{request.customerCompany}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>{request.warehouse}</TableCell>
                    {visibleColumns.email && <TableCell className={cellClass}>{request.email}</TableCell>}
                    <TableCell className={cellClass}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${requestTypeBadgeClass[request.requestType]} ${badgeClass}`}>
                          {typeLabel[request.requestType]}
                        </Badge>
                        {request.isAdditional && (
                          <Badge className={`bg-slate-100 text-slate-700 ${badgeClass}`}>Additional</Badge>
                        )}
                      </div>
                    </TableCell>
                    {visibleColumns.requestDate && <TableCell className={cellClass}>{request.requestDate}</TableCell>}
                    <TableCell className={cellClass}>{request.lastUpdate}</TableCell>
                    <TableCell className={cellClass}>
                      <Badge className={`${requestStatusBadgeClass[request.status]} ${badgeClass}`}>
                        {statusLabel[request.status]}
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
                        <DropdownMenuItem onSelect={() => handleOpenDetails(request)}>View details</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Export row</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && paginatedRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={emptyColSpan} className="py-14 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <span>No matching requests found. Adjust filters or clear to see all data.</span>
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <PaginationFooter
            pageSize={pageSize}
            pageIndex={pageIndex}
            totalCount={totalRequests}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}

