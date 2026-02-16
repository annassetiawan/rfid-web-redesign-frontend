"use client";

import * as React from "react";
import Link from "next/link";
import { Columns3, Download, Filter, MoreHorizontal, Search as SearchIcon, SlidersHorizontal } from "lucide-react";

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryBadgeClass, requestStatusBadgeClass, requestTypeBadgeClass, statusBadgeClass } from "@/components/shared/badge-map";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { useColumnVisibility } from "@/components/shared/use-column-visibility";
import { useDensity } from "@/components/shared/use-density";
import { accessories, products } from "@/lib/mock/inventory";
import { masterUnits } from "@/lib/mock/master-units";
import { localRequests } from "@/lib/mock/requests";
import { unitRelations } from "@/lib/mock/unit-relations";
import type { InventoryItem } from "@/lib/types/inventory";
import type { MasterUnit, MasterUnitCategory, MasterUnitStatus } from "@/lib/types/master-unit";
import type { RequestStatus, RequestType } from "@/lib/types/request";
import type { SearchType } from "@/lib/types/search";
import type { UnitRelation } from "@/lib/types/unit-relation";

type RequestFilters = {
  status: "all" | RequestStatus;
  requestType: "all" | RequestType;
  warehouse: string;
};

type UnitFilters = {
  status: "all" | MasterUnitStatus;
  category: "all" | MasterUnitCategory;
};

type InventoryFilters = {
  status: "all" | InventoryItem["status"];
  inventoryStatus: "all" | InventoryItem["inventoryStatus"];
  location: "all" | InventoryItem["location"];
};

type RelationFilters = {
  status: "all" | UnitRelation["status"];
  mainUnitId: string;
};

type RequestColumns = {
  email: boolean;
  requestDate: boolean;
};

type UnitColumns = {
  id: boolean;
  updated: boolean;
};

type InventoryColumns = {
  warehouseLocation: boolean;
  taggedDate: boolean;
};

type RelationColumns = {
  accessories: boolean;
  updated: boolean;
};

const inventoryStatusBadge: Record<InventoryItem["inventoryStatus"], string> = {
  in_stock: "bg-emerald-50 text-emerald-700",
  in_transit: "bg-blue-50 text-blue-700",
  assigned: "bg-amber-50 text-amber-700"
};

const inventoryStatusLabel: Record<InventoryItem["inventoryStatus"], string> = {
  in_stock: "In Stock",
  in_transit: "In Transit",
  assigned: "Assigned"
};

const requestStatusLabel: Record<RequestStatus, string> = {
  new: "New",
  inprogress: "In Progress",
  processed: "Processed"
};

const requestTypeLabel: Record<RequestType, string> = {
  delivery: "Delivery",
  pickup: "Pickup"
};

const defaultRequestFilters: RequestFilters = {
  status: "all",
  requestType: "all",
  warehouse: "all"
};

const defaultUnitFilters: UnitFilters = {
  status: "all",
  category: "all"
};

const defaultInventoryFilters: InventoryFilters = {
  status: "all",
  inventoryStatus: "all",
  location: "all"
};

const defaultRelationFilters: RelationFilters = {
  status: "all",
  mainUnitId: "all"
};

export default function SearchPage() {
  const [activeType, setActiveType] = React.useState<SearchType>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [requestFilters, setRequestFilters] = React.useState<RequestFilters>(defaultRequestFilters);
  const [unitFilters, setUnitFilters] = React.useState<UnitFilters>(defaultUnitFilters);
  const [inventoryFilters, setInventoryFilters] = React.useState<InventoryFilters>(defaultInventoryFilters);
  const [relationFilters, setRelationFilters] = React.useState<RelationFilters>(defaultRelationFilters);
  const [draftRequestFilters, setDraftRequestFilters] = React.useState<RequestFilters>(defaultRequestFilters);
  const [draftUnitFilters, setDraftUnitFilters] = React.useState<UnitFilters>(defaultUnitFilters);
  const [draftInventoryFilters, setDraftInventoryFilters] = React.useState<InventoryFilters>(defaultInventoryFilters);
  const [draftRelationFilters, setDraftRelationFilters] = React.useState<RelationFilters>(defaultRelationFilters);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [selectedDetail, setSelectedDetail] = React.useState<{ type: Exclude<SearchType, "all">; id: string } | null>(null);

  const { density, setDensity, rowClass, cellClass, badgeClass, actionBtnClass } = useDensity("comfortable");

  const { columns: requestColumns, setColumns: setRequestColumns } = useColumnVisibility<RequestColumns>(
    "columns:search-requests",
    { email: false, requestDate: true }
  );
  const { columns: unitColumns, setColumns: setUnitColumns } = useColumnVisibility<UnitColumns>(
    "columns:search-units",
    { id: false, updated: true }
  );
  const { columns: inventoryColumns, setColumns: setInventoryColumns } = useColumnVisibility<InventoryColumns>(
    "columns:search-inventory",
    { warehouseLocation: true, taggedDate: true }
  );
  const { columns: relationColumns, setColumns: setRelationColumns } = useColumnVisibility<RelationColumns>(
    "columns:search-relations",
    { accessories: true, updated: true }
  );

  const unitMap = React.useMemo(() => {
    const map = new Map<string, MasterUnit>();
    masterUnits.forEach((unit) => map.set(unit.id, unit));
    return map;
  }, []);

  const warehouseOptions = React.useMemo(() => {
    return Array.from(new Set(localRequests.map((item) => item.warehouse)));
  }, []);

  const requestResults = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return localRequests.filter((item) => {
      if (query) {
        const haystack = [
          item.requestNumber,
          item.customerCompany,
          item.email,
          item.warehouse,
          requestTypeLabel[item.requestType]
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (requestFilters.status !== "all" && item.status !== requestFilters.status) {
        return false;
      }
      if (requestFilters.requestType !== "all" && item.requestType !== requestFilters.requestType) {
        return false;
      }
      if (requestFilters.warehouse !== "all" && item.warehouse !== requestFilters.warehouse) {
        return false;
      }
      return true;
    });
  }, [requestFilters, searchQuery]);

  const unitResults = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return masterUnits.filter((item) => {
      if (query) {
        const haystack = [item.id, item.name, item.category].join(" ").toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (unitFilters.status !== "all" && item.status !== unitFilters.status) {
        return false;
      }
      if (unitFilters.category !== "all" && item.category !== unitFilters.category) {
        return false;
      }
      return true;
    });
  }, [searchQuery, unitFilters]);

  const inventoryResults = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const merged = [...products, ...accessories].map((item) => ({
      ...item,
      unitName: unitMap.get(item.unitId)?.name ?? "Unknown Unit"
    }));
    return merged.filter((item) => {
      if (query) {
        const haystack = [
          item.unitName,
          item.serialNumber,
          item.rfidCode,
          item.warehouseLocation,
          item.location,
          inventoryStatusLabel[item.inventoryStatus]
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (inventoryFilters.status !== "all" && item.status !== inventoryFilters.status) {
        return false;
      }
      if (inventoryFilters.inventoryStatus !== "all" && item.inventoryStatus !== inventoryFilters.inventoryStatus) {
        return false;
      }
      if (inventoryFilters.location !== "all" && item.location !== inventoryFilters.location) {
        return false;
      }
      return true;
    });
  }, [searchQuery, unitMap, inventoryFilters]);

  const relationResults = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return unitRelations
      .map((relation) => {
        const mainProductName = unitMap.get(relation.mainUnitId)?.name ?? "Unknown Main Product";
        const accessoriesLabel = relation.accessoryUnitIds.map((id) => unitMap.get(id)?.name ?? "Unknown Accessory");
        return { ...relation, mainProductName, accessoriesLabel };
      })
      .filter((item) => {
        if (query) {
          const haystack = [item.id, item.mainProductName, ...item.accessoriesLabel].join(" ").toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }
        if (relationFilters.status !== "all" && item.status !== relationFilters.status) {
          return false;
        }
        if (relationFilters.mainUnitId !== "all" && item.mainUnitId !== relationFilters.mainUnitId) {
          return false;
        }
        return true;
      });
  }, [relationFilters.mainUnitId, relationFilters.status, searchQuery, unitMap]);

  const allTopResults = React.useMemo(
    () => ({
      requests: requestResults.slice(0, 5),
      units: unitResults.slice(0, 5),
      inventory: inventoryResults.slice(0, 5),
      relations: relationResults.slice(0, 5)
    }),
    [inventoryResults, relationResults, requestResults, unitResults]
  );

  const activeFilterCount = React.useMemo(() => {
    if (activeType === "requests") {
      return (
        (requestFilters.status !== "all" ? 1 : 0) +
        (requestFilters.requestType !== "all" ? 1 : 0) +
        (requestFilters.warehouse !== "all" ? 1 : 0)
      );
    }
    if (activeType === "units") {
      return (unitFilters.status !== "all" ? 1 : 0) + (unitFilters.category !== "all" ? 1 : 0);
    }
    if (activeType === "inventory") {
      return (
        (inventoryFilters.status !== "all" ? 1 : 0) +
        (inventoryFilters.inventoryStatus !== "all" ? 1 : 0) +
        (inventoryFilters.location !== "all" ? 1 : 0)
      );
    }
    if (activeType === "relations") {
      return (relationFilters.status !== "all" ? 1 : 0) + (relationFilters.mainUnitId !== "all" ? 1 : 0);
    }
    return 0;
  }, [activeType, inventoryFilters, relationFilters.mainUnitId, relationFilters.status, requestFilters, unitFilters]);

  React.useEffect(() => {
    setPageIndex(1);
  }, [activeType, searchQuery, requestFilters, unitFilters, inventoryFilters, relationFilters, density, pageSize]);

  React.useEffect(() => {
    if (!filtersOpen) {
      return;
    }
    if (activeType === "requests") {
      setDraftRequestFilters(requestFilters);
    }
    if (activeType === "units") {
      setDraftUnitFilters(unitFilters);
    }
    if (activeType === "inventory") {
      setDraftInventoryFilters(inventoryFilters);
    }
    if (activeType === "relations") {
      setDraftRelationFilters(relationFilters);
    }
  }, [activeType, filtersOpen, requestFilters, unitFilters, inventoryFilters, relationFilters]);

  const handleApplyFilters = () => {
    if (activeType === "requests") {
      setRequestFilters(draftRequestFilters);
    }
    if (activeType === "units") {
      setUnitFilters(draftUnitFilters);
    }
    if (activeType === "inventory") {
      setInventoryFilters(draftInventoryFilters);
    }
    if (activeType === "relations") {
      setRelationFilters(draftRelationFilters);
    }
    setFiltersOpen(false);
  };

  const handleClearFilters = () => {
    if (activeType === "requests") {
      setRequestFilters(defaultRequestFilters);
      setDraftRequestFilters(defaultRequestFilters);
    }
    if (activeType === "units") {
      setUnitFilters(defaultUnitFilters);
      setDraftUnitFilters(defaultUnitFilters);
    }
    if (activeType === "inventory") {
      setInventoryFilters(defaultInventoryFilters);
      setDraftInventoryFilters(defaultInventoryFilters);
    }
    if (activeType === "relations") {
      setRelationFilters(defaultRelationFilters);
      setDraftRelationFilters(defaultRelationFilters);
    }
    setFiltersOpen(false);
  };

  const currentCount =
    activeType === "requests"
      ? requestResults.length
      : activeType === "units"
        ? unitResults.length
        : activeType === "inventory"
          ? inventoryResults.length
          : activeType === "relations"
            ? relationResults.length
            : 0;

  const totalPages = Math.max(1, Math.ceil(currentCount / pageSize));
  const clampedPageIndex = Math.min(pageIndex, totalPages);

  const selectedRequestDetail =
    selectedDetail?.type === "requests"
      ? localRequests.find((item) => item.id === selectedDetail.id) ?? null
      : null;
  const selectedUnitDetail =
    selectedDetail?.type === "units"
      ? masterUnits.find((item) => item.id === selectedDetail.id) ?? null
      : null;
  const selectedInventoryDetail =
    selectedDetail?.type === "inventory"
      ? inventoryResults.find((item) => item.id === selectedDetail.id) ?? null
      : null;
  const selectedRelationDetail =
    selectedDetail?.type === "relations"
      ? relationResults.find((item) => item.id === selectedDetail.id) ?? null
      : null;

  const renderFilterContent = () => {
    if (activeType === "requests") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Request Status</p>
            <Select
              value={draftRequestFilters.status}
              onValueChange={(value) =>
                setDraftRequestFilters((current) => ({ ...current, status: value as RequestFilters["status"] }))
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
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Request Type</p>
            <Select
              value={draftRequestFilters.requestType}
              onValueChange={(value) =>
                setDraftRequestFilters((current) => ({ ...current, requestType: value as RequestFilters["requestType"] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All request types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Warehouse</p>
            <Select
              value={draftRequestFilters.warehouse}
              onValueChange={(value) => setDraftRequestFilters((current) => ({ ...current, warehouse: value }))}
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
        </div>
      );
    }

    if (activeType === "units") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Category</p>
            <Select
              value={draftUnitFilters.category}
              onValueChange={(value) =>
                setDraftUnitFilters((current) => ({ ...current, category: value as UnitFilters["category"] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="main">Main Product</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <Select
              value={draftUnitFilters.status}
              onValueChange={(value) => setDraftUnitFilters((current) => ({ ...current, status: value as UnitFilters["status"] }))}
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
        </div>
      );
    }

    if (activeType === "inventory") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Inventory Status</p>
            <Select
              value={draftInventoryFilters.inventoryStatus}
              onValueChange={(value) =>
                setDraftInventoryFilters((current) => ({
                  ...current,
                  inventoryStatus: value as InventoryFilters["inventoryStatus"]
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All inventory statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Location</p>
            <Select
              value={draftInventoryFilters.location}
              onValueChange={(value) =>
                setDraftInventoryFilters((current) => ({ ...current, location: value as InventoryFilters["location"] }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="customer_site">Customer Site</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <Select
              value={draftInventoryFilters.status}
              onValueChange={(value) =>
                setDraftInventoryFilters((current) => ({ ...current, status: value as InventoryFilters["status"] }))
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
        </div>
      );
    }

    if (activeType === "relations") {
      const mainProducts = masterUnits.filter((unit) => unit.category === "main");
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Main Product</p>
            <Select
              value={draftRelationFilters.mainUnitId}
              onValueChange={(value) => setDraftRelationFilters((current) => ({ ...current, mainUnitId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All main products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {mainProducts.map((unit) => (
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
              value={draftRelationFilters.status}
              onValueChange={(value) =>
                setDraftRelationFilters((current) => ({ ...current, status: value as RelationFilters["status"] }))
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
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">No additional filters for "All" search type.</p>;
  };

  return (
    <div className="flex flex-col gap-6">
      <Sheet open={Boolean(selectedDetail)} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <SheetContent className="flex flex-col gap-4 px-6 pb-6 pt-4">
          <SheetHeader>
            <SheetTitle>Result Detail</SheetTitle>
            <SheetDescription>Overview of selected search result.</SheetDescription>
          </SheetHeader>
          {selectedRequestDetail && (
            <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm md:grid-cols-2">
              <p className="font-medium">No: {selectedRequestDetail.requestNumber}</p>
              <p className="font-medium">Customer: {selectedRequestDetail.customerCompany}</p>
              <p className="font-medium">Warehouse: {selectedRequestDetail.warehouse}</p>
              <Badge className={requestStatusBadgeClass[selectedRequestDetail.status]}>
                {requestStatusLabel[selectedRequestDetail.status]}
              </Badge>
            </div>
          )}
          {selectedUnitDetail && (
            <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm md:grid-cols-2">
              <p className="font-medium">Name: {selectedUnitDetail.name}</p>
              <p className="font-medium">ID: {selectedUnitDetail.id}</p>
              <Badge className={categoryBadgeClass[selectedUnitDetail.category]}>
                {selectedUnitDetail.category === "main" ? "Main Product" : "Accessory"}
              </Badge>
              <Badge className={statusBadgeClass[selectedUnitDetail.status]}>{selectedUnitDetail.status}</Badge>
            </div>
          )}
          {selectedInventoryDetail && (
            <div className="grid gap-3 rounded-lg border border-border/60 p-4 text-sm md:grid-cols-2">
              <p className="font-medium">Unit: {selectedInventoryDetail.unitName}</p>
              <p className="font-medium">Serial: {selectedInventoryDetail.serialNumber}</p>
              <p className="font-medium">RFID: {selectedInventoryDetail.rfidCode}</p>
              <Badge className={inventoryStatusBadge[selectedInventoryDetail.inventoryStatus]}>
                {inventoryStatusLabel[selectedInventoryDetail.inventoryStatus]}
              </Badge>
            </div>
          )}
          {selectedRelationDetail && (
            <div className="space-y-3 rounded-lg border border-border/60 p-4 text-sm">
              <p className="font-medium">Main: {selectedRelationDetail.mainProductName}</p>
              <Badge className={statusBadgeClass[selectedRelationDetail.status]}>{selectedRelationDetail.status}</Badge>
              <div className="flex flex-wrap gap-2">
                {selectedRelationDetail.accessoriesLabel.map((name) => (
                  <Badge key={name} className={categoryBadgeClass.accessory}>
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <PageHeader title="Search" subtitle="Search across requests, units, inventory, and relations." />
      <Separator />

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 pl-10 text-base"
              placeholder="Search request number, unit name, serial, RFID, company..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Tabs value={activeType} onValueChange={(value) => setActiveType(value as SearchType)}>
            <TabsList className="w-fit">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="relations">Relations</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {activeType === "all" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Requests</CardTitle>
              <Button asChild variant="link" className="h-auto p-0 text-indigo-600">
                <Link href="/requests/local">View all in Requests</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {allTopResults.requests.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left hover:bg-muted/40"
                  onClick={() => setSelectedDetail({ type: "requests", id: item.id })}
                >
                  <span className="text-sm font-medium">{item.requestNumber}</span>
                  <Badge className={requestStatusBadgeClass[item.status]}>{requestStatusLabel[item.status]}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Units</CardTitle>
              <Button asChild variant="link" className="h-auto p-0 text-indigo-600">
                <Link href="/master-data/units">View all in Units</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {allTopResults.units.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left hover:bg-muted/40"
                  onClick={() => setSelectedDetail({ type: "units", id: item.id })}
                >
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge className={categoryBadgeClass[item.category]}>
                    {item.category === "main" ? "Main Product" : "Accessory"}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Inventory</CardTitle>
              <Button asChild variant="link" className="h-auto p-0 text-indigo-600">
                <Link href="/inventory">View all in Inventory</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {allTopResults.inventory.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left hover:bg-muted/40"
                  onClick={() => setSelectedDetail({ type: "inventory", id: item.id })}
                >
                  <span className="text-sm font-medium">{item.unitName}</span>
                  <Badge className={inventoryStatusBadge[item.inventoryStatus]}>
                    {inventoryStatusLabel[item.inventoryStatus]}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Relations</CardTitle>
              <Button asChild variant="link" className="h-auto p-0 text-indigo-600">
                <Link href="/master-data/unit-relation">View all in Relations</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {allTopResults.relations.map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left hover:bg-muted/40"
                  onClick={() => setSelectedDetail({ type: "relations", id: item.id })}
                >
                  <span className="text-sm font-medium">{item.mainProductName}</span>
                  <Badge className={statusBadgeClass[item.status]}>{item.status}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <TableToolbar
              searchPlaceholder="Search results..."
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
                        <SheetDescription>Filters adapt to selected search type.</SheetDescription>
                      </SheetHeader>
                      {renderFilterContent()}
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
                      {activeType === "requests" && (
                        <>
                          <DropdownMenuCheckboxItem
                            checked={requestColumns.email}
                            onCheckedChange={(value) => setRequestColumns((c) => ({ ...c, email: Boolean(value) }))}
                          >
                            Email
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={requestColumns.requestDate}
                            onCheckedChange={(value) => setRequestColumns((c) => ({ ...c, requestDate: Boolean(value) }))}
                          >
                            Request Date
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
                      {activeType === "units" && (
                        <>
                          <DropdownMenuCheckboxItem
                            checked={unitColumns.id}
                            onCheckedChange={(value) => setUnitColumns((c) => ({ ...c, id: Boolean(value) }))}
                          >
                            Unit ID
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={unitColumns.updated}
                            onCheckedChange={(value) => setUnitColumns((c) => ({ ...c, updated: Boolean(value) }))}
                          >
                            Updated
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
                      {activeType === "inventory" && (
                        <>
                          <DropdownMenuCheckboxItem
                            checked={inventoryColumns.warehouseLocation}
                            onCheckedChange={(value) =>
                              setInventoryColumns((c) => ({ ...c, warehouseLocation: Boolean(value) }))
                            }
                          >
                            Warehouse
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={inventoryColumns.taggedDate}
                            onCheckedChange={(value) => setInventoryColumns((c) => ({ ...c, taggedDate: Boolean(value) }))}
                          >
                            Tagged Date
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
                      {activeType === "relations" && (
                        <>
                          <DropdownMenuCheckboxItem
                            checked={relationColumns.accessories}
                            onCheckedChange={(value) => setRelationColumns((c) => ({ ...c, accessories: Boolean(value) }))}
                          >
                            Accessories
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={relationColumns.updated}
                            onCheckedChange={(value) => setRelationColumns((c) => ({ ...c, updated: Boolean(value) }))}
                          >
                            Updated
                          </DropdownMenuCheckboxItem>
                        </>
                      )}
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
                  <span>{currentCount} results</span>
                </>
              }
            />
            <div className="rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className={rowClass}>
                    {activeType === "requests" && (
                      <>
                        <TableHead className={cellClass}>Request No.</TableHead>
                        <TableHead className={cellClass}>Customer</TableHead>
                        <TableHead className={cellClass}>Warehouse</TableHead>
                        {requestColumns.email && <TableHead className={cellClass}>Email</TableHead>}
                        {requestColumns.requestDate && <TableHead className={cellClass}>Request Date</TableHead>}
                        <TableHead className={cellClass}>Type</TableHead>
                        <TableHead className={cellClass}>Status</TableHead>
                        <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                      </>
                    )}
                    {activeType === "units" && (
                      <>
                        <TableHead className={cellClass}>Name</TableHead>
                        {unitColumns.id && <TableHead className={cellClass}>Unit ID</TableHead>}
                        <TableHead className={cellClass}>Category</TableHead>
                        {unitColumns.updated && <TableHead className={cellClass}>Updated</TableHead>}
                        <TableHead className={cellClass}>Status</TableHead>
                        <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                      </>
                    )}
                    {activeType === "inventory" && (
                      <>
                        <TableHead className={cellClass}>Unit</TableHead>
                        <TableHead className={cellClass}>Serial</TableHead>
                        <TableHead className={cellClass}>RFID</TableHead>
                        <TableHead className={cellClass}>Inventory Status</TableHead>
                        {inventoryColumns.warehouseLocation && <TableHead className={cellClass}>Warehouse</TableHead>}
                        {inventoryColumns.taggedDate && <TableHead className={cellClass}>Tagged Date</TableHead>}
                        <TableHead className={cellClass}>Status</TableHead>
                        <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                      </>
                    )}
                    {activeType === "relations" && (
                      <>
                        <TableHead className={cellClass}>Main Product</TableHead>
                        {relationColumns.accessories && <TableHead className={cellClass}>Accessories</TableHead>}
                        {relationColumns.updated && <TableHead className={cellClass}>Updated</TableHead>}
                        <TableHead className={cellClass}>Status</TableHead>
                        <TableHead className={`${cellClass} text-right`}>Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeType === "requests" &&
                    requestResults.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize).map((item) => (
                      <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => setSelectedDetail({ type: "requests", id: item.id })}>
                        <TableCell className={`${cellClass} font-medium`}>{item.requestNumber}</TableCell>
                        <TableCell className={cellClass}>{item.customerCompany}</TableCell>
                        <TableCell className={cellClass}>{item.warehouse}</TableCell>
                        {requestColumns.email && <TableCell className={cellClass}>{item.email}</TableCell>}
                        {requestColumns.requestDate && <TableCell className={cellClass}>{item.requestDate}</TableCell>}
                        <TableCell className={cellClass}>
                          <Badge className={`${requestTypeBadgeClass[item.requestType]} ${badgeClass}`}>
                            {requestTypeLabel[item.requestType]}
                          </Badge>
                        </TableCell>
                        <TableCell className={cellClass}>
                          <Badge className={`${requestStatusBadgeClass[item.status]} ${badgeClass}`}>{requestStatusLabel[item.status]}</Badge>
                        </TableCell>
                        <TableCell className={`${cellClass} text-right`}>
                          <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {activeType === "units" &&
                    unitResults.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize).map((item) => (
                      <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => setSelectedDetail({ type: "units", id: item.id })}>
                        <TableCell className={`${cellClass} font-medium`}>{item.name}</TableCell>
                        {unitColumns.id && <TableCell className={cellClass}>{item.id}</TableCell>}
                        <TableCell className={cellClass}>
                          <Badge className={`${categoryBadgeClass[item.category]} ${badgeClass}`}>
                            {item.category === "main" ? "Main Product" : "Accessory"}
                          </Badge>
                        </TableCell>
                        {unitColumns.updated && <TableCell className={cellClass}>{item.updatedAt}</TableCell>}
                        <TableCell className={cellClass}>
                          <Badge className={`${statusBadgeClass[item.status]} ${badgeClass}`}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className={`${cellClass} text-right`}>
                          <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {activeType === "inventory" &&
                    inventoryResults.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize).map((item) => (
                      <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => setSelectedDetail({ type: "inventory", id: item.id })}>
                        <TableCell className={`${cellClass} font-medium`}>{item.unitName}</TableCell>
                        <TableCell className={cellClass}>{item.serialNumber}</TableCell>
                        <TableCell className={cellClass}>{item.rfidCode}</TableCell>
                        <TableCell className={cellClass}>
                          <Badge className={`${inventoryStatusBadge[item.inventoryStatus]} ${badgeClass}`}>{inventoryStatusLabel[item.inventoryStatus]}</Badge>
                        </TableCell>
                        {inventoryColumns.warehouseLocation && <TableCell className={cellClass}>{item.warehouseLocation}</TableCell>}
                        {inventoryColumns.taggedDate && <TableCell className={cellClass}>{item.taggedDate}</TableCell>}
                        <TableCell className={cellClass}>
                          <Badge className={`${statusBadgeClass[item.status]} ${badgeClass}`}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className={`${cellClass} text-right`}>
                          <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {activeType === "relations" &&
                    relationResults.slice((clampedPageIndex - 1) * pageSize, clampedPageIndex * pageSize).map((item) => (
                      <TableRow key={item.id} className={`${rowClass} cursor-pointer hover:bg-muted/40`} onClick={() => setSelectedDetail({ type: "relations", id: item.id })}>
                        <TableCell className={`${cellClass} font-medium`}>{item.mainProductName}</TableCell>
                        {relationColumns.accessories && (
                          <TableCell className={cellClass}>
                            <div className="flex flex-wrap gap-1.5">
                              {item.accessoriesLabel.slice(0, 3).map((name) => (
                                <Badge key={`${item.id}-${name}`} className={`${categoryBadgeClass.accessory} ${badgeClass}`}>
                                  {name}
                                </Badge>
                              ))}
                              {item.accessoriesLabel.length > 3 && (
                                <Badge variant="secondary" className={badgeClass}>
                                  +{item.accessoriesLabel.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {relationColumns.updated && <TableCell className={cellClass}>{item.updatedAt}</TableCell>}
                        <TableCell className={cellClass}>
                          <Badge className={`${statusBadgeClass[item.status]} ${badgeClass}`}>{item.status}</Badge>
                        </TableCell>
                        <TableCell className={`${cellClass} text-right`}>
                          <Button variant="ghost" size="icon" className={actionBtnClass} onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {currentCount === 0 && (
                    <TableRow className={rowClass}>
                      <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        No results found for current search and filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <PaginationFooter
                pageSize={pageSize}
                pageIndex={pageIndex}
                totalCount={currentCount}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
