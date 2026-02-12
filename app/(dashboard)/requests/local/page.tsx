"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  Filter,
  Plus,
  SlidersHorizontal,
  Columns3,
  RefreshCw,
  Search,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { localRequests } from "@/lib/mock/requests";
import type { LocalRequest, RequestStatus, RequestType } from "@/lib/types/request";


const statusLabel: Record<RequestStatus, string> = {
  new: "New",
  inprogress: "In Progress",
  processed: "Processed"
};

const statusBadgeClass: Record<RequestStatus, string> = {
  new: "bg-amber-100 text-amber-700",
  inprogress: "bg-blue-100 text-blue-700",
  processed: "bg-emerald-100 text-emerald-700"
};

const typeLabel: Record<RequestType, string> = {
  delivery: "Delivery",
  pickup: "Pickup"
};

const typeBadgeClass: Record<RequestType, string> = {
  delivery: "bg-emerald-50 text-emerald-700",
  pickup: "bg-blue-50 text-blue-700"
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
  customerCompany: string;
  email: string;
};

const defaultFilters: FilterState = {
  warehouse: "all",
  requestType: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  customerCompany: "",
  email: ""
};

const warehouseOptions = ["Jakarta Hub", "Bandung DC", "Surabaya Hub", "Semarang Node", "Medan DC", "Makassar Hub"];

export default function LocalRequestsPage() {
  const [filters, setFilters] = React.useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = React.useState("");
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
      return true;
    });
  }, [filters, searchQuery]);

  const sortedRequests = React.useMemo(() => {
    const statusOrder: Record<RequestStatus, number> = {
      urgent: 0,
      new: 1,
      inprogress: 2,
      processed: 3,
      cancelled: 4
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

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const pages = new Set<number>([1, totalPages, clampedPageIndex]);
    if (clampedPageIndex > 2) {
      pages.add(clampedPageIndex - 1);
    }
    if (clampedPageIndex < totalPages - 1) {
      pages.add(clampedPageIndex + 1);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  React.useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    setPageIndex(1);
  }, [pageSize, filters, sortKey, sortDirection]);

  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleString("en-US"));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Sheet open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="flex flex-col gap-6">
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
                    <Badge className={typeBadgeClass[selectedRequest.requestType]}>
                      {typeLabel[selectedRequest.requestType]}
                    </Badge>
                    <Badge className={statusBadgeClass[selectedRequest.status]}>
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
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Requests</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Local Request List</h1>
          <p className="text-sm text-slate-500" suppressHydrationWarning>
            Local time: {currentTime ?? "--"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Link href="/requests/local/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Request
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/requests/local/additional">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Create Additional Delivery
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search request number, customer, email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <Badge className="ml-2 bg-slate-100 text-slate-600 hover:bg-slate-100">{activeFilterCount}</Badge>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-6">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>Refine local requests by status, owner, or timeframe.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Warehouse</p>
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
                <p className="text-sm font-medium text-slate-700">Request Status</p>
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
                <p className="text-sm font-medium text-slate-700">Request Type</p>
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
                <p className="text-sm font-medium text-slate-700">Request Date</p>
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
                <p className="text-sm font-medium text-slate-700">Customer Company</p>
                <Input
                  placeholder="Search customer company"
                  value={filters.customerCompany}
                  onChange={(event) => setFilters((prev) => ({ ...prev, customerCompany: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Email</p>
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
        {activeFilterCount > 0 && (
          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Status</DropdownMenuItem>
            <DropdownMenuItem>Owner</DropdownMenuItem>
            <DropdownMenuItem>Customer</DropdownMenuItem>
            <DropdownMenuItem>Last Updated</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="text-slate-500">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Local Requests</CardTitle>
            <p className="text-sm text-slate-500">Track requests, approvals, and hand-offs at a glance.</p>
          </div>
          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50">{totalRequests} Results</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table className="min-w-[1100px]">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead>Request No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("requestDate")}
                  >
                    Request Date
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("lastUpdate")}
                  >
                    Last Update
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <TableCell key={`skeleton-cell-${cellIndex}`}>
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading &&
                paginatedRequests.map((request: LocalRequest) => (
                  <TableRow key={request.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium text-slate-900">
                    <Button
                      variant="ghost"
                      className="h-auto px-0 text-indigo-600 hover:text-indigo-700"
                      onClick={() => handleOpenDetails(request)}
                    >
                      {request.requestNumber}
                    </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{request.customerCompany}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{request.warehouse}</TableCell>
                    <TableCell className="text-slate-600">{request.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={typeBadgeClass[request.requestType]}>{typeLabel[request.requestType]}</Badge>
                      {request.isAdditional && (
                        <Badge className="bg-slate-100 text-slate-700">Additional</Badge>
                      )}
                    </div>
                  </TableCell>
                    <TableCell className="text-slate-600">{request.requestDate}</TableCell>
                    <TableCell className="text-slate-600">{request.lastUpdate}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClass[request.status]}>{statusLabel[request.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
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
                  <TableCell colSpan={9} className="py-14 text-center text-sm text-slate-500">
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>
                Showing {(clampedPageIndex - 1) * pageSize + (paginatedRequests.length ? 1 : 0)}-
                {(clampedPageIndex - 1) * pageSize + paginatedRequests.length} of {totalRequests} requests
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">Page size</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[88px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={clampedPageIndex === 1}
                    onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
                  />
                </PaginationItem>
                {getPageNumbers().map((pageNumber, index, pages) => {
                  const previous = pages[index - 1];
                  const showGap = previous && pageNumber - previous > 1;
                  return (
                    <React.Fragment key={pageNumber}>
                      {showGap && (
                        <PaginationItem>
                          <PaginationLink disabled>...</PaginationLink>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          isActive={pageNumber === clampedPageIndex}
                          onClick={() => setPageIndex(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    disabled={clampedPageIndex === totalPages}
                    onClick={() => setPageIndex((prev) => Math.min(totalPages, prev + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

